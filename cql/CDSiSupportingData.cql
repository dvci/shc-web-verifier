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
	"EvaluateSeries"

define "EvaluateSeries":
	AntigenSupportingData.series series
	where series.seriesType != 'Risk'
	return Tuple {
		seriesName: series.seriesName,
		complete: ("EvaluateSeriesImmunizations"(series.seriesName, series.seriesDose)).where(validPrimarySeries = true)
	}

define function "EvaluateSeriesImmunizations" (seriesName String,
	seriesDoses List<Tuple{
		doseNumber String, 
		age Tuple{absMinAge Tuple{value Decimal, unit String}, earliestRecAge Tuple{value Decimal, unit String}}, 
		interval List<Tuple{fromPrevious String, earliestRecInt Tuple{value Decimal, unit String}}>, 
		allowableInterval List<Tuple{fromPrevious String, absMinInt Tuple{value Decimal, unit String}}>,  
		allowableVaccine List<Tuple{cvx String}>,
		conditionalSkip Tuple{context String} }>):
    "Immunizations" immunization      
        aggregate all R starting (List{} as List<Tuple{startingImmunizationIndex Integer, validSeries Boolean }>): 
            R union ({
            immunization X
                let currentImmunizationIndex: Count(R),
				doseEvaluations: "EvaluateSeriesDoses"(seriesDoses, currentImmunizationIndex)
                 return(
					Tuple {
                    	startingImmunizationIndex: currentImmunizationIndex,                 
                    	validPrimarySeries: IsValidPrimarySeries(seriesName, seriesDoses, doseEvaluations),
						doses: doseEvaluations.where(validDose = true),
						allDoses: doseEvaluations
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
                let currentImmunizationIndex: if Count(R)>0 then Count(R) + startingImmunizationIndex else startingImmunizationIndex,
				previousDoseImmunizationIndex: if Count(R)>0 then (Last(R)).immunizationIndex else -1,
                previousValidImmunizationIndex: if Count(R)>0 and Last(R.where(validDose = true)) is not null then (Last(R.where(validDose = true))).immunizationIndex else -1,
                currentDoseIndex: if Count(R)>0 then Count(R) else 0
                return(
					"EvaluateSeriesDose"(seriesDose, currentDoseIndex, currentImmunizationIndex, previousDoseImmunizationIndex, previousValidImmunizationIndex)
				)
            })

define function "EvaluateSeriesDose" (seriesDose Tuple{
		doseNumber String, 
		age Tuple{absMinAge Tuple{value Decimal, unit String}, earliestRecAge Tuple{value Decimal, unit String}}, 
		interval List<Tuple{fromPrevious String, earliestRecInt Tuple{value Decimal, unit String}}>, 
		allowableInterval List<Tuple{fromPrevious String, absMinInt Tuple{value Decimal, unit String}}>,  
		allowableVaccine List<Tuple{cvx String}>,
		conditionalSkip Tuple{context String} },
        currentDoseIndex Integer, currentImmunizationIndex Integer, previousDoseImmunizationIndex Integer, previousValidImmunizationIndex Integer):
	if currentImmunizationIndex >= Count("Immunizations") or previousDoseImmunizationIndex != previousValidImmunizationIndex
    	then Tuple {
			doseNumber: seriesDose.doseNumber,
            doseIndex: currentDoseIndex,
            immunizationIndex: null,   
			immunization: null,
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
	//if Count(doseEvaluations.where(validDose = true)) = Count(seriesDoses)
	//then true
	//else if Count(doseEvaluations.where(validDose = true)) = 0 
	//		or not AllTrue(Take(doseEvaluations, Count(doseEvaluations.where(validDose = true))).validDose)
	//	then false
	//	else if "IsRecommendedSeriesDose"(seriesDoses[Count(doseEvaluations.where(validDose = true))],
	//		Immunizations[Last(doseEvaluations.where(validDose = true)).immunizationIndex])
	//	then false //next dose in series is due as of today
	//	else true

define function "IsRecommendedSeriesDose" (seriesDose Tuple{
		doseNumber String, 
		age Tuple{absMinAge Tuple{value Decimal, unit String}, earliestRecAge Tuple{value Decimal, unit String}}, 
		interval List<Tuple{fromPrevious String, earliestRecInt Tuple{value Decimal, unit String}}>, 
		allowableInterval List<Tuple{fromPrevious String, absMinInt Tuple{value Decimal, unit String}}>,  
		allowableVaccine List<Tuple{cvx String}>,
		conditionalSkip Tuple{context String} },
		previousImmunization FHIR.Immunization):
	"IsRecommendedByEarliestRecAge"(seriesDose.age)
	and "IsRecommendedByEarliestRecInterval"(seriesDose.interval, previousImmunization) 
	and "IsRecommendedByConditionalSkip"(seriesDose.conditionalSkip)

define function "IsRecommendedByEarliestRecAge" (age Tuple{absMinAge Tuple{value Decimal, unit String}, earliestRecAge Tuple{value Decimal, unit String}}):
	if Count(age) = 0 
		or age.earliestRecAge.value is null
	then
		false
	else
		case age.earliestRecAge.unit
			when 'd' then AgeInDays() >= age.earliestRecAge.value	
			when 'wk' then AgeInWeeks() >= age.earliestRecAge.value	
			when 'mo' then AgeInMonths() >= age.earliestRecAge.value	
			when 'a' then AgeInYears() >= age.earliestRecAge.value	
			else null
		end	

define function "IsRecommendedByEarliestRecInterval" (
		interval List<Tuple{fromPrevious String, earliestRecInt Tuple{value Decimal, unit String}}>,
		previousImmunization FHIR.Immunization) returns Boolean:
	if Count(interval) = 0 
		or Count(First(interval.where(fromPrevious = 'Y'))) = 0 
		or First(interval.where(fromPrevious = 'Y')).earliestRecInt.value is null
		or previousImmunization is null
	then
		false
	else
		case First(interval.where(fromPrevious = 'Y')).earliestRecInt.unit
			when 'd' then difference in days between (previousImmunization.occurrence as FHIR.dateTime) and Today() 
				>= First(interval.where(fromPrevious = 'Y')).earliestRecInt.value
			when 'wk' then difference in weeks between (previousImmunization.occurrence as FHIR.dateTime) and Today() 
				>= First(interval.where(fromPrevious = 'Y')).earliestRecInt.value				
			when 'mo' then difference in months between (previousImmunization.occurrence as FHIR.dateTime) and Today()
				>= First(interval.where(fromPrevious = 'Y')).earliestRecInt.value
			when 'a' then difference in years between (previousImmunization.occurrence as FHIR.dateTime) and Today()
				>= First(interval.where(fromPrevious = 'Y')).earliestRecInt.value
			else null
		end

define function "IsRecommendedByConditionalSkip" (
		conditionalSkip Tuple{context String}) returns Boolean:
	if conditionalSkip.context in {'Forecast', 'Both'}
	then false
	else true
				