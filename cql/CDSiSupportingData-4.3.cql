library CDSiSupportingData version '4.3'

using FHIR version '4.0.0'
using CDSI version '1.0.0'
include FHIRHelpers version '4.0.0' called FHIRHelpers

parameter AntigenSupportingData CDSI.AntigenSupportingData

parameter AntigenAncillaryData Tuple{series List<Tuple{seriesName String, primarySeriesNumberDoses Integer}>}

context Patient

define "Immunizations":
	[Immunization] immunization
	sort by (occurrence as FHIR.dateTime) asc

define "Run":
	EvaluateAllSeries

define "EvaluateAllSeries":
	AntigenSupportingData.series series
		let evaluations: "EvaluateSeries"(series.seriesName, series.selectSeries, series.seriesDose)
		where series.seriesType != 'Risk'	
	return Tuple {
		seriesName: series.seriesName,
		validPrimarySeries: exists evaluations.where(validPrimarySeries = true),
		evaluations: evaluations
	}

define function "EvaluateSeries" (seriesName String,
	selectSeries CDSI.SelectSeries,
	seriesDoses List<CDSI.SeriesDose>):
    "Immunizations" immunization      
        aggregate all R starting (List{} as List<Tuple{startingImmunizationIndex Integer, validPrimarySeries Boolean }>): 
            R union ({
            immunization X
                let startingImmunizationIndex: Count(R),
				doseEvaluations: flatten("EvaluateSeriesDoses"(selectSeries, seriesDoses, startingImmunizationIndex))
                 return(
					Tuple {
                    	startingImmunizationIndex: startingImmunizationIndex,
                    	validPrimarySeries: IsValidPrimarySeries(seriesName, seriesDoses, doseEvaluations),
						doseEvaluations: doseEvaluations
                    }
                )
            }) 

define function "EvaluateSeriesDoses" (selectSeries CDSI.SelectSeries,
		seriesDoses List<CDSI.SeriesDose>,
        startingImmunizationIndex Integer):
	seriesDoses seriesDose  
        aggregate all R starting (List{} as List<List<Tuple{immunizationIndex Integer, doseIndex Integer, doseNumber String, validDose Boolean }>>): 
            R union ({
            seriesDose X
                let previousValidDoseIndex: (Last((flatten(R)).where(validDose = true))).doseIndex,
                previousValidImmunizationIndex: (Last((flatten(R)).where(validDose = true))).immunizationIndex,
                currentDoseIndex: Count(R),
				doseImmunizationEvaluations: "EvaluateSeriesDose"(selectSeries, seriesDose, currentDoseIndex, startingImmunizationIndex, previousValidDoseIndex, previousValidImmunizationIndex)
                return(
					if exists doseImmunizationEvaluations.where(validDose is not null)
					then doseImmunizationEvaluations.where(validDose is not null)
					else {Tuple { 
						doseNumber: seriesDose.doseNumber,
						doseIndex: currentDoseIndex,
						immunizationIndex: null,   
						immunization: null,
						validDose: null
					}}
				)
            })

define function "EvaluateSeriesDose" (selectSeries CDSI.SelectSeries,
		seriesDose CDSI.SeriesDose,
        currentDoseIndex Integer, startingImmunizationIndex Integer, previousValidDoseIndex Integer, previousValidImmunizationIndex Integer):
    ("Immunizations".skip(if exists previousValidImmunizationIndex then previousValidImmunizationIndex + 1 else startingImmunizationIndex)) immunization
        aggregate all R starting (List{} as List<Tuple{doseNumber String, doseIndex Integer, immunizationIndex Integer, immunization FHIR.Immunization, validDose Boolean }>): 
            R union ({
            immunization X
                let currentImmunizationIndex: if exists previousValidImmunizationIndex then Count(R) + previousValidImmunizationIndex + 1 else Count(R) + startingImmunizationIndex,
				currentValidImmunizationIndex: (Last(R.where(validDose = true))).immunizationIndex
                return(
					if exists currentValidImmunizationIndex
						or (currentDoseIndex > 0 and not exists previousValidDoseIndex)
					then Tuple {
						doseNumber: seriesDose.doseNumber,
						doseIndex: currentDoseIndex,
						immunizationIndex: currentImmunizationIndex,   
						immunization: "Immunizations"[currentImmunizationIndex],
						validDose: null
					}
					else
						EvaluateSeriesDoseImmunization(selectSeries, seriesDose, currentDoseIndex, currentImmunizationIndex, previousValidDoseIndex, previousValidImmunizationIndex)
                )
            }) 		

define function "EvaluateSeriesDoseImmunization" (selectSeries CDSI.SelectSeries,
		seriesDose CDSI.SeriesDose,
        currentDoseIndex Integer, currentImmunizationIndex Integer, previousValidDoseIndex Integer, previousValidImmunizationIndex Integer):  
	Tuple {
		doseNumber: seriesDose.doseNumber,
		doseIndex: currentDoseIndex,
		immunizationIndex: currentImmunizationIndex,   
		immunization: "Immunizations"[currentImmunizationIndex],
		validDose: "IsValidSeriesDose"(selectSeries, seriesDose, "Immunizations"[currentImmunizationIndex], 
			if currentImmunizationIndex > 0 then "Immunizations"[currentImmunizationIndex - 1] else null)
	}						

define function "IsValidSeriesDose" (selectSeries CDSI.SelectSeries,
		seriesDose CDSI.SeriesDose,
		immunization FHIR.Immunization,
		previousImmunization FHIR.Immunization):
	(previousImmunization is not null or "IsValidSeriesAgeToStart"(selectSeries, immunization))
	and "IsValidAge"(seriesDose.age, immunization)
	and "IsValidInterval"(seriesDose.interval, immunization, previousImmunization)
	and "IsValidInterval"(seriesDose.allowableInterval, immunization, previousImmunization)
	and "IsValidAllowableVaccine"(seriesDose.allowableVaccine, immunization)
	and "IsNotInadvertentVaccine"(seriesDose.inadvertentVaccine, immunization)

define function "IsValidSeriesAgeToStart"(selectSeries CDSI.SelectSeries,
		immunization FHIR.Immunization):
	((not exists selectSeries.minAgeToStart)
		or immunization.occurrence >= DateAsOfAge(selectSeries.minAgeToStart))
	and ((not exists selectSeries.maxAgeToStart)
		or immunization.occurrence < DateAsOfAge(selectSeries.maxAgeToStart))

define function "IsValidAllowableVaccine" (allowableVaccine List<CDSI.SeriesDose.AllowableVaccine>, 
		immunization FHIR.Immunization) returns Boolean:
	exists(
		flatten(immunization.vaccineCode.coding coding
			where coding.system = 'http://hl7.org/fhir/sid/cvx'
			return(allowableVaccine av
      			where coding.code = av.cvx
      			and ((not exists av.beginAge)
					or immunization.occurrence >= DateAsOfAge(av.beginAge))
				and ((not exists av.endAge)
					or immunization.occurrence < DateAsOfAge(av.endAge))
    		)
		)	
	)

define function "IsNotInadvertentVaccine" (inadvertentVaccine List<CDSI.SeriesDose.InadvertentVaccine>, 
		immunization FHIR.Immunization) returns Boolean:
	not exists(
		flatten(immunization.vaccineCode.coding coding
			where coding.system = 'http://hl7.org/fhir/sid/cvx'
			return(inadvertentVaccine iv
      			where coding.code = iv.cvx
    		)
		)	
	)	

define function "IsValidInterval" (intervals List<CDSI.SeriesDose.DoseInterval>, 
		immunization FHIR.Immunization,
		previousImmunization FHIR.Immunization) returns Boolean:
	if ApplicableInterval(intervals, immunization) is null
		or previousImmunization is null
	then true
	else immunization.occurrence as FHIR.dateTime >= DateTimeAsOf(previousImmunization.occurrence as FHIR.dateTime, ApplicableInterval(intervals, immunization).absMinInt)

define function "IsValidAge" (age CDSI.SeriesDose.Age, 
		immunization FHIR.Immunization):
	(not exists age.absMinAge)
		or immunization.occurrence >= DateAsOfAge(age.absMinAge)

define function "IsValidPrimarySeries" (primarySeriesName String,
		seriesDoses List<CDSI.SeriesDose>,
		doseEvaluations List<Tuple{doseNumber String, doseIndex Integer, 
		immunizationIndex Integer, validDose Boolean }>):
	Count(doseEvaluations.where(validDose = true)) >= First(AntigenAncillaryData.series.where(seriesName = primarySeriesName)).primarySeriesNumberDoses

define function "ApplicableInterval" (intervals List<CDSI.SeriesDose.DoseInterval>, 
		immunization FHIR.Immunization) returns CDSI.SeriesDose.DoseInterval:
	First(
		intervals i
			where i.fromPrevious = 'Y'
			and ((not exists i.effectiveDate) or immunization.occurrence as FHIR.dateTime >= i.effectiveDate)
			and ((not exists i.cessationDate) or immunization.occurrence as FHIR.dateTime <= i.cessationDate)
			and exists i.absMinInt
	)

define function "DateAsOfAge"(ageWithGracePeriod List<System.Quantity>):
	DateAsOf(Patient.birthDate, ageWithGracePeriod)

define function "DateAsOf"(startDate FHIR.date, intervalWithGracePeriod List<System.Quantity>):
	if Length(intervalWithGracePeriod) = 1
	then startDate + First(intervalWithGracePeriod)
	else startDate + First(intervalWithGracePeriod) + intervalWithGracePeriod[1]

define function "DateTimeAsOf"(startDate FHIR.dateTime, intervalWithGracePeriod List<System.Quantity>):
	if Length(intervalWithGracePeriod) = 1
	then startDate + First(intervalWithGracePeriod)
	else startDate + First(intervalWithGracePeriod) + intervalWithGracePeriod[1]