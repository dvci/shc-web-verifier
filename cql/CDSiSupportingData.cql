library CDSiSupportingData version '1'

using FHIR version '4.0.0'
include FHIRHelpers version '4.0.0' called FHIRHelpers

parameter AntigenSupportingData Tuple{series List<Tuple{seriesName String, 
	seriesDose List<Tuple{
		doseNumber String, 
		age Tuple{absMinAge Tuple{value Decimal, unit String}, earliestRecAge Tuple{value Decimal, unit String}}, 
		allowableInterval Tuple{fromPrevious String, absMinInt Tuple{value Decimal, unit String}}, 
		allowableVaccine List<Tuple{cvx String}> }>
}>}

context Patient

define "Immunizations":
	[Immunization] immunization
	sort by (occurrence as FHIR.dateTime) asc

define "Run":
	"EvaluateSeries"

define "EvaluateSeries":
	AntigenSupportingData.series series
	return Tuple {
		seriesName: series.seriesName,
		complete: ("EvaluateSeriesImmunizations"(series.seriesDose)).where(validSeries = true).doses
	}

define function "EvaluateSeriesImmunizations" (seriesDoses List<Tuple{doseNumber String, age Tuple{absMinAge Tuple{value Decimal, unit String}, earliestRecAge Tuple{value Decimal, unit String}}, allowableInterval Tuple{fromPrevious String, absMinInt Tuple{value Decimal, unit String}}, allowableVaccine List<Tuple{cvx String}> }>):
    "Immunizations" immunization      
        aggregate all R starting (List{} as List<Tuple{startingImmunizationIndex Integer, validSeries Boolean }>): 
            R union ({
            immunization X
                let currentImmunizationIndex: Count(R),
				eval: "EvaluateSeriesDoses"(seriesDoses, currentImmunizationIndex)
                 return(
                    if Count(eval.where(validDose = true or recommendedDose = false)) = Count(seriesDoses)
                    then Tuple {
                        startingImmunizationIndex: currentImmunizationIndex,                 
                        validSeries: true,
						doses: eval.where(validDose = true),
						allDoses: eval
                    }
                    else Tuple {
                        startingImmunizationIndex: currentImmunizationIndex,                 
                        validSeries: false,
						doses: null,
						allDoses: eval
                    }
                )
            }) 

define function "EvaluateSeriesDoses" (seriesDoses List<Tuple{doseNumber String, age Tuple{absMinAge Tuple{value Decimal, unit String}, earliestRecAge Tuple{value Decimal, unit String}}, allowableInterval Tuple{fromPrevious String, absMinInt Tuple{value Decimal, unit String}}, allowableVaccine List<Tuple{cvx String}> }>,
        startingImmunizationIndex Integer):
	seriesDoses seriesDose  
        aggregate all R starting (List{} as List<Tuple{immunizationIndex Integer, doseIndex Integer, doseNumber String, validDose Boolean }>): 
            R union ({
            seriesDose X
                let currentImmunizationIndex: if Count(R)>0 then Count(R) + startingImmunizationIndex else startingImmunizationIndex,
                previousValidImmunizationIndex: if Count(R)>0 then (Last(R.where(validDose = true))).immunizationIndex else -1,
                currentDoseIndex: if Count(R)>0 then Count(R) else 0
                return(
					"EvaluateSeriesDose"(seriesDose, currentDoseIndex, currentImmunizationIndex, previousValidImmunizationIndex)
				)
            })

define function "EvaluateSeriesDose" (seriesDose Tuple{doseNumber String, age Tuple{absMinAge Tuple{value Decimal, unit String}, earliestRecAge Tuple{value Decimal, unit String}}, allowableInterval Tuple{fromPrevious String, absMinInt Tuple{value Decimal, unit String}}, allowableVaccine List<Tuple{cvx String}> },
        currentDoseIndex Integer, currentImmunizationIndex Integer, previousValidImmunizationIndex Integer):
	if currentImmunizationIndex >= Count("Immunizations")
    	then Tuple {
			doseNumber: seriesDose.doseNumber,
            doseIndex: currentDoseIndex,
            immunizationIndex: null,   
			immunization: null,              
            validDose: null,
			recommendedDose: "RecommendedSeriesDose"(seriesDose, null, "Immunizations"[previousValidImmunizationIndex])
		}
    else
        Tuple {
            doseNumber: seriesDose.doseNumber,
            doseIndex: currentDoseIndex,
            immunizationIndex: currentImmunizationIndex,   
			immunization: "Immunizations"[currentImmunizationIndex],              
            validDose: "ValidSeriesDose"(seriesDose, "Immunizations"[currentImmunizationIndex], "Immunizations"[previousValidImmunizationIndex]),
			recommendedDose: "RecommendedSeriesDose"(seriesDose, "Immunizations"[currentImmunizationIndex], "Immunizations"[previousValidImmunizationIndex])
        }				

define function "ValidSeriesDose" (seriesDose Tuple{doseNumber String, age Tuple{absMinAge Tuple{value Decimal, unit String}, earliestRecAge Tuple{value Decimal, unit String}}, allowableInterval Tuple{fromPrevious String, absMinInt Tuple{value Decimal, unit String}}, allowableVaccine List<Tuple{cvx String}> },
		immunization FHIR.Immunization,
		previousImmunization FHIR.Immunization):
	"ValidAllowableVaccine"(seriesDose.allowableVaccine, immunization)
	//and "ValidAllowableInterval"(seriesDose.allowableInterval, immunization, previousImmunization)
	//and "ValidAllowableAge"(seriesDose.age, immunization)

define function "ValidAllowableVaccine" (allowableVaccine List<Tuple{cvx String}>, immunization FHIR.Immunization) returns Boolean:
	exists(immunization.vaccineCode.coding coding
		where coding.system = 'http://hl7.org/fhir/sid/cvx'
			and coding.code in allowableVaccine.cvx
	)

define function "ValidAllowableInterval" (allowableInterval Tuple{fromPrevious String, absMinInt Tuple{value Decimal, unit String}}, 
		immunization FHIR.Immunization,
		previousImmunization FHIR.Immunization) returns Boolean:
	if Count(allowableInterval) = 0 
		or allowableInterval.absMinInt.value is null
	then
		true
	else
		allowableInterval.fromPrevious	= 'Y'
		and previousImmunization is not null
		and 
			case allowableInterval.absMinInt.unit
				when 'd' then difference in days between (previousImmunization.occurrence as FHIR.dateTime) and (immunization.occurrence as FHIR.dateTime) 
					>= allowableInterval.absMinInt.value
				when 'mo' then difference in months between (previousImmunization.occurrence as FHIR.dateTime) and (immunization.occurrence as FHIR.dateTime) 
					>= allowableInterval.absMinInt.value
				when 'a' then difference in years between (previousImmunization.occurrence as FHIR.dateTime) and (immunization.occurrence as FHIR.dateTime) 
					>= allowableInterval.absMinInt.value
				else null
			end

define function "ValidAllowableAge" (age Tuple{absMinAge Tuple{value Decimal, unit String}, earliestRecAge Tuple{value Decimal, unit String}}, 
		immunization FHIR.Immunization):
	if Count(age) = 0 
		or age.absMinAge.value is null
	then
		true		
	else
		case age.absMinAge.unit
			when 'd' then AgeInDaysAt(immunization.occurrence as FHIR.dateTime) >= age.absMinAge.value	
			when 'mo' then AgeInMonthsAt(immunization.occurrence as FHIR.dateTime) >= age.absMinAge.value	
			when 'a' then AgeInYearsAt(immunization.occurrence as FHIR.dateTime) >= age.absMinAge.value	
			else null
		end

define function "RecommendedSeriesDose" (seriesDose Tuple{doseNumber String, age Tuple{absMinAge Tuple{value Decimal, unit String}, earliestRecAge Tuple{value Decimal, unit String}}, allowableInterval Tuple{fromPrevious String, absMinInt Tuple{value Decimal, unit String}}, allowableVaccine List<Tuple{cvx String}> },
		immunization FHIR.Immunization,
		previousImmunization FHIR.Immunization):
	"RecommendedByEarliestRecAge"(seriesDose.age)		 

define function "RecommendedByEarliestRecAge" (age Tuple{absMinAge Tuple{value Decimal, unit String}, earliestRecAge Tuple{value Decimal, unit String}}):
	if Count(age) = 0 
		or age.earliestRecAge.value is null
	then
		false
	else
		case age.earliestRecAge.unit
			when 'd' then AgeInDays() >= age.earliestRecAge.value	
			when 'mo' then AgeInMonths() >= age.earliestRecAge.value	
			when 'a' then AgeInYears() >= age.earliestRecAge.value	
			else null
		end		