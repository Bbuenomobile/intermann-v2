const hiddenLeads = require("../models/hiddenLeads");
const Client = require("../models/client");


exports.hideClientProfile = async (req,res,next) => {
    ////console.log('hiding client...', req.body);
    const { clientId } = req.body;
    Client.findByIdAndRemove(clientId)
    .then((result) => {
        ////console.log("-----------------------");
        ////console.log(result);
        const hl = new hiddenLeads({
            clientArchived: result.clientArchived,
            salary_hours: result.salary_hours,
            rate_hours: result.rate_hours,
            clientCompanyName: result.clientCompanyName,
            clientActivitySector: result.clientActivitySector,
            clientJob: result.clientJob,
            clientEmail: result.clientEmail,
            clientPhone: result.clientPhone,
            clientAddress: result.clientAddress,
            clientReferenceName: result.clientReferenceName,
            clientReferenceNumber: result.clientReferenceNumber,
            clientRequiredSkills: result.clientRequiredSkills,
            numberOfPosts: result.numberOfPosts,
            clientMotivation: result.clientMotivation,
            jobStartDate: result.jobStartDate,
            jobEndDate: result.jobEndDate,
            jobTotalBudget: result.jobTotalBudget,
            netSalary: result.netSalary,
            clientImportance: result.clientImportance,
            clientLanguages: result.clientLanguages,
            enteredBy: result.enteredBy,
            jobStatus: result.candidatCurrentWork,
            enteredBy: result.enteredBy,
            employeesWorkingUnder: result.employeesWorkingUnder,
            note_cofac: result.note_cofac,
            leadOrigin: result.leadOrigin,
            offerSent: result.offerSent,
            signatureSent: result.signatureSent,
  contractSigned: result.contractSigned,
  publicityStarted: result.publicityStarted,
  A1selected: result.A1selected,
  assuranceFaite: result.assuranceFaite,
  agenceDeVoyage: result.agenceDeVoyage,
  sispiDeclared: result.sispiDeclared,
  clientDocuments: [],
        });
        hl.save().then((resSave) => {
            ////console.log(resSave)
            return res.status(200).json({
                status: true,
                message: 'Client Hidden Successfully!'
            })
        }).catch(err => {
            ////console.log(err)
            return res.status(400).json({
                status: false,
                message: 'Cannot Hide Client! Try Again.'
            })
        });
    })
    .catch(err => {
        return res.status(400).json({
            status: false,
            message: 'Cannot Hide Client! Try Again.'
        })
    })
}  
