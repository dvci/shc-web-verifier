library CDSiSupportingData version '1'

using FHIR version '4.0.0'
include FHIRHelpers version '4.0.0' called FHIRHelpers

parameter SeriesDefinition FHIR.Parameters

context Patient

define "Immunizations":
	[Immunization] immunization
	sort by (occurrence as FHIR.dateTime) asc

define "Run":
	"EvaluateSeries"

define "EvaluateSeries":
	(SeriesDefinition.parameter.where(name = 'series')) series
	return Tuple {
		seriesName: series.part.where(name = 'seriesName').first().value.value,
		complete: ("EvaluateSeriesDoses"(series.part.where(name = 'seriesDose'))).where(validSeries = true).doses
	}

define function "EvaluateSeriesDoses" (seriesDoses List<FHIR.Parameters.Parameter>):
    "Immunizations" immunization      
        aggregate all R starting (List{} as List<Tuple{startingImmunizationIndex Integer, validSeries Boolean }>): 
            R union ({
            immunization X
                let currentImmunizationIndex: Count(R),
				eval: "EvaluateImmunizations"(seriesDoses, currentImmunizationIndex)
                 return(
                    if Count(eval.where(validDose = true or recommendedDose = false)) = Count(seriesDoses)
                    then Tuple {
                        startingImmunizationIndex: currentImmunizationIndex,                 
                        validSeries: true,
						doses: eval.where(validDose = true)
                    }
                    else Tuple {
                        startingImmunizationIndex: currentImmunizationIndex,                 
                        validSeries: false,
						doses: null
                    }
                )
            }) 

define function "EvaluateImmunizations" (seriesDoses List<FHIR.Parameters.Parameter>,
        startingImmunizationIndex Integer):
    ("Immunizations".skip(startingImmunizationIndex)) immunization      
        aggregate all R starting (List{} as List<Tuple{immunizationIndex Integer, doseIndex Integer, doseNumber String, validDose Boolean }>): 
            R union ({
            immunization X
                let currentImmunizationIndex: if Count(R)>0 then Count(R) + startingImmunizationIndex else startingImmunizationIndex,
                previousValidImmunizationIndex: if Count(R)>0 and exists(R.where(validDose = true)) then (Last(R.where(validDose = true))).immunizationIndex else -1,
                currentDoseIndex: if Count(R)>0 and exists(R.where(validDose = true)) then (Last(R.where(validDose = true))).doseIndex + 1 else 0
                return(
                    if currentDoseIndex >= Count(seriesDoses)
                    then Tuple {
						doseNumber: null,
                        doseIndex: null,
                        immunizationIndex: currentImmunizationIndex,   
						immunization: "Immunizations"[currentImmunizationIndex],              
                        validDose: null,
						recommendedDose: null
					}
                    else
                        Tuple {
                            doseNumber: seriesDoses[currentDoseIndex].part.where(name = 'doseNumber').first().value.value,
                            doseIndex: currentDoseIndex,
                            immunizationIndex: currentImmunizationIndex,   
							immunization: "Immunizations"[currentImmunizationIndex],              
                            validDose: "ValidSeriesDose"(seriesDoses[currentDoseIndex], "Immunizations"[currentImmunizationIndex], "Immunizations"[previousValidImmunizationIndex]),
							recommendedDose: "RecommendedSeriesDose"(seriesDoses[currentDoseIndex], "Immunizations"[currentImmunizationIndex], "Immunizations"[previousValidImmunizationIndex])
                        }
                )
            }) 

define function "ValidSeriesDose" (seriesDose List<FHIR.Parameters.Parameter>,
		immunization FHIR.Immunization,
		previousImmunization FHIR.Immunization):
	"ValidAllowableVaccine"(seriesDose.part.where(name = 'allowableVaccine'), immunization)
	and "ValidAllowableInterval"(seriesDose.part.where(name = 'allowableInterval'), immunization, previousImmunization)
	and "ValidAllowableAge"(seriesDose.part.where(name = 'age'), immunization)

define function "ValidAllowableVaccine" (allowableVaccine List<FHIR.Parameters.Parameter>, immunization FHIR.Immunization) returns Boolean:
	exists(immunization.vaccineCode.coding coding
		where coding.system = 'http://hl7.org/fhir/sid/cvx'
			and coding.code in allowableVaccine.part.where(name = 'cvx').value.value
	)

define function "ValidAllowableInterval" (allowableInterval List<FHIR.Parameters.Parameter>, 
		immunization FHIR.Immunization,
		previousImmunization FHIR.Immunization) returns Boolean:
	if Count(allowableInterval) = 0 
		or allowableInterval.part.where(name = 'absMinInt').first().value.value.value is null
	then
		true
	else
		allowableInterval.part.where(name = 'fromPrevious').first().value.value	= 'Y'
		and previousImmunization is not null
		and 
			case allowableInterval.part.where(name = 'absMinInt').first().value.unit.value
				when 'd' then difference in days between (previousImmunization.occurrence as FHIR.dateTime) and (immunization.occurrence as FHIR.dateTime) 
					>= allowableInterval.part.where(name = 'absMinInt').first().value.value.value
				when 'mo' then difference in months between (previousImmunization.occurrence as FHIR.dateTime) and (immunization.occurrence as FHIR.dateTime) 
					>= allowableInterval.part.where(name = 'absMinInt').first().value.value.value
				when 'a' then difference in years between (previousImmunization.occurrence as FHIR.dateTime) and (immunization.occurrence as FHIR.dateTime) 
					>= allowableInterval.part.where(name = 'absMinInt').first().value.value.value
				else null
			end

define function "ValidAllowableAge" (age List<FHIR.Parameters.Parameter>, 
		immunization FHIR.Immunization):
	if Count(age) = 0 
		or age.part.where(name = 'absMinAge').first().value.value.value is null
	then
		true		
	else
		case age.part.where(name = 'absMinAge').first().value.unit.value
			when 'd' then AgeInDaysAt(immunization.occurrence as FHIR.dateTime) >= age.part.where(name = 'absMinAge').first().value.value.value	
			when 'mo' then AgeInMonthsAt(immunization.occurrence as FHIR.dateTime) >= age.part.where(name = 'absMinAge').first().value.value.value	
			when 'a' then AgeInYearsAt(immunization.occurrence as FHIR.dateTime) >= age.part.where(name = 'absMinAge').first().value.value.value	
			else null
		end

define function "RecommendedSeriesDose" (seriesDose List<FHIR.Parameters.Parameter>,
		immunization FHIR.Immunization,
		previousImmunization FHIR.Immunization):
	"ValidEarliestRecAge"(seriesDose.part.where(name = 'age'), immunization)		 

define function "ValidEarliestRecAge" (age List<FHIR.Parameters.Parameter>, 
		immunization FHIR.Immunization):
	if Count(age) = 0 
		or age.part.where(name = 'earliestRecAge').first().value.value.value is null
	then
		true		
	else
		case age.part.where(name = 'earliestRecAge').first().value.unit.value
			when 'd' then AgeInDaysAt(immunization.occurrence as FHIR.dateTime) >= age.part.where(name = 'earliestRecAge').first().value.value.value	
			when 'mo' then AgeInMonthsAt(immunization.occurrence as FHIR.dateTime) >= age.part.where(name = 'earliestRecAge').first().value.value.value	
			when 'a' then AgeInYearsAt(immunization.occurrence as FHIR.dateTime) >= age.part.where(name = 'earliestRecAge').first().value.value.value	
			else null
		end		