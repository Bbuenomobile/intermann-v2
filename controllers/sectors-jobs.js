const ActivitySector = require("../models/activitySector");
const Job = require("../models/job");
const Candidat = require("../models/candidat");
const Mongoose = require("mongoose");
const client = require("../models/client");

exports.fetchAllSectors = async (req, res, next) => {
    const sectors = await ActivitySector.find({});
    if (sectors) {
        return res.status(200).json({
            message: "All Sectors Found!",
            data: sectors
        })
    } else {
        return res.status(400).json({
            message: "Sectors Not Found!",
        })
    }
}

exports.fetchAllJobs = async (req, res, next) => {
    let { sector } = req.query;
    ////console.log(sector);
    const results = await ActivitySector.findOne({ sectorName: sector })
    ////console.log(results);
    if (results?.jobs) {
        return res.status(200).json({
            message: "All Jobs Found!",
            data: results.jobs,
            status: true
        })
    } else {
        return res.status(404).json({
            message: "No Jobs Found For Selected Sector!",
            data: [],
            status: false,
        })
    }
}

exports.checkSectorExists = async (req, res, next) => {
    const { sector } = req.query;
    ////console.log(sector);
    await ActivitySector.findOne({ sectorName: sector })
        .then((data) => {
            if (data) {
                ////console.log(data);
                return res.status(404).json({
                    message: "Sector Exists!",
                    status: false,
                })
            } else {
                return res.status(200).json({
                    message: "Sector is New, can be Added.",
                    status: true
                })
            }
        })
        .catch(err => {
            ////console.log(err)
            return res.status(500).json({
                message: "Cannot Check if Sector Exists!"
            })
        })
}

exports.checkJobExists = async (req, res, next) => {
    const { sector, job } = req.query;
    ////console.log(req.query);
    ////console.log(sector, job);
    await ActivitySector.findOne({
        sectorName: sector, jobs: {
            $elemMatch: {
                jobName: job
            }
        }
    })
        .then((data) => {
            ////console.log(data);
            if (data) {

                return res.status(404).json({
                    message: "Job Exists!",
                    status: false,
                })
            } else {
                ActivitySector.updateOne({ sectorName: sector }, {
                    $push: {
                        jobs: {
                            jobName: job,
                            associatedSector: sector
                        }
                    }
                }).then(savedData => {
                    ////console.log(savedData);
                    return res.status(200).json({
                        message: "Job is New! Added to the Sector.",
                        status: true
                    })
                })

            }
        })
        .catch(err => {
            ////console.log(err)
            return res.status(500).json({
                message: "Cannot Check if Job Exists!"
            })
        })
}

exports.updateSector = async (req, res, next) => {
    ////console.log(req.body)
    const { currentName, newName } = req.body;
    await ActivitySector.findOneAndUpdate({
        sectorName: currentName
    }, {
        $set: {
            sectorName: newName,
            'jobs.$[job].associatedSector': newName,
        }
    }, {
        arrayFilters: [{ 'job.associatedSector': currentName }]
    }).then(async data => {
        ////console.log(data)
        if (data) {
            await Candidat.updateMany({
                candidatActivitySector: currentName
            }, {
                candidatActivitySector: newName
            })
                .then(async redata => {
                    await client.updateMany({
                        clientActivitySector: currentName
                    }, {
                        clientActivitySector: newName
                    })
                        .then((resultclient) => {
                            ////console.log(resultclient);
                            return res.status(200).json({
                                message: "Sector Renamed Successfully!",
                                status: true,
                            })
                        })
                        .catch(err => {
                            ////console.log(err)
                            return res.status(404).json({
                                message: "Sector Not Renamed!",
                                status: false
                            })
                        })
                })
        } else {

            return res.status(404).json({
                message: "Unable To Rename Sector!",
                status: false
            })
        }
    })
        .catch(err => {
            ////console.log(err);
        })
}

exports.updateJob = async (req, res, next) => {
    ////console.log(req.body)
    const { currentJobName, currentSectorName, newName } = req.body;
    let result = await ActivitySector.findOne({
        sectorName: currentSectorName
    })
    result = result.jobs.map((job) => {
        if (job.jobName == currentJobName) {
            job['jobName'] = newName;
            return job;
        }
        return job;
    })
    await ActivitySector.findOneAndUpdate({
        sectorName: currentSectorName
    }, {
        jobs: result
    })
        .then(async data => {
            ////console.log(data)
            await Candidat.updateMany({
                candidatJob: currentJobName
            }, {
                candidatJob: newName
            })
                .then(async redata => {
                    await client.updateMany({
                        clientJob: currentJobName
                    }, {
                        clientJob: newName
                    })
                        .then(resdata => {
                            return res.status(200).json({
                                message: "Job Renamed Successfully!",
                                status: true,
                            })
                        })
                        .catch(err => {
                            return res.status(404).json({
                                message: "Job Not Renamed!",
                                status: false
                            })
                        })

                })
                .catch(err => {
                    return res.status(404).json({
                        message: "Job Not Renamed!",
                        status: false
                    })
                })
        })
        .catch(err => {
            ////console.log(err)
            return res.status(404).json({
                message: "Job Not Renamed!",
                status: false
            })
        })
}

exports.saveSector = async (req, res, next) => {
    const {
        sectorName,
        jobs // going to be an Array;
    } = req.body;
    ////console.log(req.body);
    ////console.log(sectorName, jobs);
    const sector = await ActivitySector.findOne({
        sectorName: sectorName
    });

    ////console.log(sector)
    if (sector) {
        return res.status(200).json({
            message: "Sector Already Exists!",
        })

    } else {

        try {
            const newSector = new ActivitySector({
                sectorName: sectorName,
                jobs: jobs
            })

            newSector
                .save()
                .then(resp => {
                    ////console.log(resp);
                    return res.status(200).json({
                        message: "Activity Sector Added Successfully!",
                        status: true,
                    })
                })
                .catch(err => {
                    ////console.log(err);
                    return res.status(400).json({
                        message: "Error Adding this Activity Sector! Please Try Again",
                        statuts: false
                    })
                })
        } catch (err) {
            ////console.log(err);
            return res.status(400).json({
                message: "Internal Error While Adding this Activity Sector! Please Try Again",
                statuts: false
            })
        }

    }

}

exports.fetchProfilesForAJob = async (req, res, next) => {
    const { jobName } = req.body
    const results = await Candidat.find({ candidatJob: jobName })
    if (results) {
        return res.status(200).json({
            message: "Profiles Fetched!",
            status: true,
            data: results
        })
    } else {
        return res.status(404).json({
            message: "No Profiles Found!",
            status: false,
        })
    }
}