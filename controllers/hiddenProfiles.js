const hiddenProfiles = require("../models/hiddenProfiles");
const Candidat = require("../models/candidat");


exports.hideCandidatProfile = async (req,res,next) => {
    //console.log('hiding candidat...', req.body);
    const { candidatId } = req.body;
    Candidat.findByIdAndRemove(candidatId)
    .then((result) => {
        //console.log("-----------------------");
        //console.log(result.candidatName);
        const hp = new hiddenProfiles({
            candidatName: result.candidatName,
            candidatEmail: result.candidatEmail,
            candidatPhone: result.candidatPhone,
            candidatAddress: result.candidatAddress,
            candidatActivitySector: result.candidatActivitySector,
            candidatJob: result.candidatJob,
            candidatFBURL: result.candidatFBURL,
            candidatAlternatePhone: result.candidatAlternatePhone,
            candidatSkills: result.candidatSkills,
            candidatAge: result.candidatAge,
            candidatMotivation: result.candidatMotivation,
            candidatLanguages: result.candidatLanguages,
            candidatLicensePermis: result.candidatLicensePermis,
            candidatConduireEnFrance: result.candidatConduireEnFrance,
            candidatStartDate: result.candidatStartDate,
            candidatEndDate: result.candidatEndDate,
            candidatYearsExperience: result.candidatYearsExperience,
            candidatComingFrom: result.candidatComingFrom,
            candidatFetes: result.candidatFetes,
            candidatPhoto: result.candidatPhoto,
            candidatExperienceDetails: result.candidatExperienceDetails,
            candidatCurrentWork: result.candidatCurrentWork,
            enteredBy: result.enteredBy,
            candidatStatus: result.candidatStatus,
            candidatPreSelectedFor: result.candidatPreSelectedFor,
            candidatDocuments: result.candidatDocuments,
            candidatArchived: result.candidatArchived,
        });
        hp.save().then((resSave) => {
            //console.log(resSave)
            return res.status(200).json({
                status: true,
                message: 'Candidat Hidden Successfully!'
            })
        }).catch(err => {
            //console.log(err)
            return res.status(400).json({
                status: false,
                message: 'Cannot Hide Candidat! Try Again.'
            })
        });
    })
    .catch(err => {
        return res.status(400).json({
            status: false,
            message: 'Cannot Hide Candidat! Try Again.'
        })
    })
}  
