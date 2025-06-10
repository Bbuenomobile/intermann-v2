const router = require('express').Router();
const LeadController = require("../../controllers/lead");
const { auth } = require('../../middleware/auth');
const { extendTimeout } = require('../../middleware/extendTimeout');

var path = require('path');

const multer = require('multer')

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads')
    },
    filename: (req, file, cb) => {
        ////console.log('file-', file)
        cb(null, file.fieldname + path.extname(file.originalname))
    }
});

var upload = multer({ storage: storage });

router.get('/allLeads', auth, LeadController.getAllLeads);
router.get('/allLeads2', LeadController.getAllLeads2);
router.get("/viewallleads", auth, LeadController.viewAllLeads);
router.post("/addLead", auth, LeadController.addLead);
router.post("/deleteLead", auth, LeadController.deleteLead);
router.post("/addLeadToCRM", auth, LeadController.addLeadToCRM);
router.get("/getAllLeadsUnique", LeadController.getAllDistinctLeads);

// router.get("/changePreContactedStatus", auth, LeadController.changePreContactedStatus);
router.get("/changeLeadContactedStatus", auth, LeadController.changeLeadContactedStatus);
router.get("/changeCRMStatus",auth, LeadController.addedToCRMStatus);
router.get("/changeQualifiedValue",auth, LeadController.changeQualifiedValue);
router.post("/updateLeadNotes", auth, LeadController.updateNotesByLeads);
router.post("/deleteLeadNotes", auth, LeadController.deleteNotesByLeads);
router.post("/editAgencyNotes", auth, LeadController.editAgencyNotes);
router.post("/deleteAgencyNotes", auth, LeadController.deleteAgencyNotes);

router.post("/filterLeads", auth, LeadController.filterLeads);

//Add via CSV routes
router.post("/addLeadsViaCSV", extendTimeout ,upload.single('leadscsv'), LeadController.addLeadsViaCSV);

router.post("/updateLeads", LeadController.updateLeads);

module.exports = {
    router: router,
    basePath: '/'
};