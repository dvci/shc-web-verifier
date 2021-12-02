library CDSiSupportingData version '1'

using FHIR version '4.0.0'
include FHIRHelpers version '4.0.0' called FHIRHelpers

parameter AntigenSupportingData Tuple{series List<Tuple{seriesName String, seriesType String,
	seriesDose List<Tuple{
		doseNumber String, 
		age Tuple{absMinAge Tuple{value Decimal, unit String}, earliestRecAge Tuple{value Decimal, unit String}}, 
		interval List<Tuple{fromPrevious String, earliestRecInt Tuple{value Decimal, unit String}}>, 
		allowableInterval List<Tuple{fromPrevious String, absMinInt Tuple{value Decimal, unit String}}>, 
		allowableVaccine List<Tuple{cvx String}>,
		conditionalSkip Tuple{context String} }>
}>}

parameter AntigenAncillaryData Tuple{series List<Tuple{seriesName String, primarySeriesNumberDoses Integer}>}

context Patient

define "Immunizations":
	[Immunization] immunization
	sort by (occurrence as FHIR.dateTime) asc

define "Run":
	"EvaluateAllSeries"

define "EvaluateAllSeries":
	AntigenSupportingData.series series
	where series.seriesType != 'Risk'
	return Tuple {
		seriesName: series.seriesName,
		complete: ("EvaluateSeries"(series.seriesName, series.seriesDose)).where(validPrimarySeries = true)
	}

define function "EvaluateSeries" (seriesName String,
	seriesDoses List<Tuple{
		doseNumber String, 
		age Tuple{absMinAge Tuple{value Decimal, unit String}, earliestRecAge Tuple{value Decimal, unit String}}, 
		interval List<Tuple{fromPrevious String, earliestRecInt Tuple{value Decimal, unit String}}>, 
		allowableInterval List<Tuple{fromPrevious String, absMinInt Tuple{value Decimal, unit String}}>,  
		allowableVaccine List<Tuple{cvx String}>,
		conditionalSkip Tuple{context String} }>):
    "Immunizations" immunization      
        aggregate all R starting (List{} as List<Tuple{startingImmunizationIndex Integer, validPrimarySeries Boolean }>): 
            R union ({
            immunization X
                let startingImmunizationIndex: Count(R),
				doseEvaluations: "EvaluateSeriesDoses"(seriesDoses, startingImmunizationIndex)
                 return(
					Tuple {
                    	startingImmunizationIndex: startingImmunizationIndex,                 
                    	validPrimarySeries: IsValidPrimarySeries(seriesName, seriesDoses, doseEvaluations),
						doses: doseEvaluations.where(validDose = true)
                    }
                )
            }) 

define function "EvaluateSeriesDoses" (seriesDoses List<Tuple{
		doseNumber String, 
		age Tuple{absMinAge Tuple{value Decimal, unit String}, earliestRecAge Tuple{value Decimal, unit String}}, 
		interval List<Tuple{fromPrevious String, earliestRecInt Tuple{value Decimal, unit String}}>, 
		allowableInterval List<Tuple{fromPrevious String, absMinInt Tuple{value Decimal, unit String}}>,  
		allowableVaccine List<Tuple{cvx String}>,
		conditionalSkip Tuple{context String} }>,
        startingImmunizationIndex Integer):
	seriesDoses seriesDose  
        aggregate all R starting (List{} as List<Tuple{immunizationIndex Integer, doseIndex Integer, doseNumber String, validDose Boolean }>): 
            R union ({
            seriesDose X
                let previousValidDoseIndex: if Count(R)>0 then (Last(R.where(validDose = true))).doseIndex else -1,
                previousValidImmunizationIndex: if Count(R)>0 then (Last(R.where(validDose = true))).immunizationIndex else -1,
                currentDoseIndex: Count(R),
				doseImmunizationEvaluations: "EvaluateSeriesDose"(seriesDose, currentDoseIndex, startingImmunizationIndex, previousValidDoseIndex, previousValidImmunizationIndex)
                return(
					if First(doseImmunizationEvaluations.where(validDose = true)) is not null
					then First(doseImmunizationEvaluations.where(validDose = true))
					else if First(doseImmunizationEvaluations.where(validDose is not null and validDose = false)) is not null
					then First(doseImmunizationEvaluations.where(validDose is not null and validDose = false))
					else if previousValidImmunizationIndex is not null and First(doseImmunizationEvaluations.where(immunizationIndex > previousValidImmunizationIndex)) is not null
					then First(doseImmunizationEvaluations.where(immunizationIndex > previousValidImmunizationIndex))
					else First(doseImmunizationEvaluations)
				)
            })

define function "EvaluateSeriesDose" (seriesDose Tuple{
		doseNumber String, 
		age Tuple{absMinAge Tuple{value Decimal, unit String}, earliestRecAge Tuple{value Decimal, unit String}}, 
		interval List<Tuple{fromPrevious String, earliestRecInt Tuple{value Decimal, unit String}}>, 
		allowableInterval List<Tuple{fromPrevious String, absMinInt Tuple{value Decimal, unit String}}>,  
		allowableVaccine List<Tuple{cvx String}>,
		conditionalSkip Tuple{context String} },
        currentDoseIndex Integer, startingImmunizationIndex Integer, previousValidDoseIndex Integer, previousValidImmunizationIndex Integer):
    ("Immunizations".skip(startingImmunizationIndex)) immunization      
        aggregate all R starting (List{} as List<Tuple{doseNumber String, doseIndex Integer, immunizationIndex Integer, immunization FHIR.Immunization, validDose Boolean }>): 
            R union ({
            immunization X
                let currentImmunizationIndex: Count(R) + startingImmunizationIndex
                return(
					EvaluateSeriesDoseImmunization(seriesDose, currentDoseIndex, currentImmunizationIndex, previousValidDoseIndex, previousValidImmunizationIndex)
                )
            }) 		

define function "EvaluateSeriesDoseImmunization" (seriesDose Tuple{
		doseNumber String, 
		age Tuple{absMinAge Tuple{value Decimal, unit String}, earliestRecAge Tuple{value Decimal, unit String}}, 
		interval List<Tuple{fromPrevious String, earliestRecInt Tuple{value Decimal, unit String}}>, 
		allowableInterval List<Tuple{fromPrevious String, absMinInt Tuple{value Decimal, unit String}}>,  
		allowableVaccine List<Tuple{cvx String}>,
		conditionalSkip Tuple{context String} },
        currentDoseIndex Integer, currentImmunizationIndex Integer, previousValidDoseIndex Integer, previousValidImmunizationIndex Integer):  
	if currentImmunizationIndex >= Count("Immunizations")
		then Tuple {
			doseNumber: seriesDose.doseNumber,
			doseIndex: currentDoseIndex,
			immunizationIndex: null,   
			immunization: null,
			validDose: null
		}
	else if previousValidDoseIndex is null or (previousValidImmunizationIndex is not null and currentImmunizationIndex <= previousValidImmunizationIndex)
		then Tuple {
			doseNumber: seriesDose.doseNumber,
			doseIndex: currentDoseIndex,
			immunizationIndex: currentImmunizationIndex,   
			immunization: "Immunizations"[currentImmunizationIndex],
			validDose: null
		}			
	else
		Tuple {
			doseNumber: seriesDose.doseNumber,
			doseIndex: currentDoseIndex,
			immunizationIndex: currentImmunizationIndex,   
			immunization: "Immunizations"[currentImmunizationIndex],
			validDose: "IsValidSeriesDose"(seriesDose, "Immunizations"[currentImmunizationIndex], "Immunizations"[previousValidImmunizationIndex])
		}						

define function "IsValidSeriesDose" (seriesDose Tuple{
		doseNumber String, 
		age Tuple{absMinAge Tuple{value Decimal, unit String}, earliestRecAge Tuple{value Decimal, unit String}}, 
		interval List<Tuple{fromPrevious String, earliestRecInt Tuple{value Decimal, unit String}}>, 
		allowableInterval List<Tuple{fromPrevious String, absMinInt Tuple{value Decimal, unit String}}>,  
		allowableVaccine List<Tuple{cvx String}>,
		conditionalSkip Tuple{context String} },
		immunization FHIR.Immunization,
		previousImmunization FHIR.Immunization):
	"IsValidAllowableVaccine"(seriesDose.allowableVaccine, immunization)
	and "IsValidAllowableInterval"(seriesDose.allowableInterval, immunization, previousImmunization)
	and "IsValidAllowableAge"(seriesDose.age, immunization)

define function "IsValidAllowableVaccine" (allowableVaccine List<Tuple{cvx String}>, immunization FHIR.Immunization) returns Boolean:
	exists(immunization.vaccineCode.coding coding
		where coding.system = 'http://hl7.org/fhir/sid/cvx'
			and coding.code in allowableVaccine.cvx
	)

define function "IsValidAllowableInterval" (allowableInterval List<Tuple{fromPrevious String, absMinInt Tuple{value Decimal, unit String}}>, 
		immunization FHIR.Immunization,
		previousImmunization FHIR.Immunization) returns Boolean:
	if Count(allowableInterval) = 0 
		or Count(First(allowableInterval.where(fromPrevious = 'Y'))) = 0 
		or First(allowableInterval.where(fromPrevious = 'Y')).absMinInt.value is null
		or previousImmunization is null
	then
		true
	else
		case First(allowableInterval.where(fromPrevious = 'Y')).absMinInt.unit
			when 'd' then difference in days between (previousImmunization.occurrence as FHIR.dateTime) and (immunization.occurrence as FHIR.dateTime) 
				>= First(allowableInterval.where(fromPrevious = 'Y')).absMinInt.value
			when 'wk' then difference in weeks between (previousImmunization.occurrence as FHIR.dateTime) and (immunization.occurrence as FHIR.dateTime) 
				>= First(allowableInterval.where(fromPrevious = 'Y')).absMinInt.value				
			when 'mo' then difference in months between (previousImmunization.occurrence as FHIR.dateTime) and (immunization.occurrence as FHIR.dateTime) 
				>= First(allowableInterval.where(fromPrevious = 'Y')).absMinInt.value				
			when 'a' then difference in years between (previousImmunization.occurrence as FHIR.dateTime) and (immunization.occurrence as FHIR.dateTime) 
				>= First(allowableInterval.where(fromPrevious = 'Y')).absMinInt.value
			else null
		end

define function "IsValidAllowableAge" (age Tuple{absMinAge Tuple{value Decimal, unit String}, earliestRecAge Tuple{value Decimal, unit String}}, 
		immunization FHIR.Immunization):
	if Count(age) = 0 
		or age.absMinAge.value is null
	then
		true		
	else
		case age.absMinAge.unit
			when 'd' then AgeInDaysAt(immunization.occurrence as FHIR.dateTime) >= age.absMinAge.value
			when 'wk' then AgeInWeeksAt(immunization.occurrence as FHIR.dateTime) >= age.absMinAge.value
			when 'mo' then AgeInMonthsAt(immunization.occurrence as FHIR.dateTime) >= age.absMinAge.value	
			when 'a' then AgeInYearsAt(immunization.occurrence as FHIR.dateTime) >= age.absMinAge.value	
			else null
		end

define function "IsValidPrimarySeries" (primarySeriesName String,
	seriesDoses List<Tuple{
		doseNumber String, 
		age Tuple{absMinAge Tuple{value Decimal, unit String}, earliestRecAge Tuple{value Decimal, unit String}}, 
		interval List<Tuple{fromPrevious String, earliestRecInt Tuple{value Decimal, unit String}}>, 
		allowableInterval List<Tuple{fromPrevious String, absMinInt Tuple{value Decimal, unit String}}>,  
		allowableVaccine List<Tuple{cvx String}>,
		conditionalSkip Tuple{context String} }>,
	doseEvaluations List<Tuple{doseNumber String, doseIndex Integer, 
		immunizationIndex Integer, validDose Boolean }>):
	Count(doseEvaluations.where(validDose = true)) >= First(AntigenAncillaryData.series.where(seriesName = primarySeriesName)).primarySeriesNumberDoses
				