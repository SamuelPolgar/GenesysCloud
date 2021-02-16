const platformClient = require('purecloud-platform-client-v2');

// Credentials

const clientId = "process.env.GenesysCloud_ClientId";
const clientSecret = "process.env.GenesysCloud_ClientSecret";

// API Instances
const recordingApi = new platformClient.RecordingApi();

// Globals
let newJob = null;

const client = platformClient.ApiClient.instance;
client.setEnvironment(platformClient.PureCloudRegionHosts.ap_southeast_2);
client.loginClientCredentialsGrant(clientId,clientSecret)
.then(()=> {
    return createRecordingBulkJob();
})
.then((job) => {
    console.log('Succesfully created recording bulk job');

    newJob = job;
    return waitOnJobProcessing(newJob.id);
})
.then(() => {
    console.log('Job is now ready: ' + newJob.id);

    return executeJob(newJob.id);
})
.then(() => {
    console.log('Succesfully execute recording bulk job');

    //return recordingApi.deleteRecordingJob(newJob.id);
})
// .then(() => {
//     console.log('Succesfully cancelled recording bulk job');

//     return getRecordingJobs();
// })
.then((result) => {
    console.log(result);

    console.log('Succesfully get recording bulk jobs')
})
.catch((err) => {
    console.log(err);
});

function createRecordingBulkJob(){
    return recordingApi.postRecordingJobs({
        action: 'EXPORT', // set to "EXPORT" for export action or DELETE
        actionDate: '2020-02-27T00:00:00.000Z',
        integrationId: 'process.env.GenesysCloud_IntegrationId', // Only required when action is EXPORT
        includeScreenRecordings: true,
        conversationQuery: {
            interval: '2019-12-31T13:00:00.000Z/2020-01-15T13:00:00.000Z',//'2019-01-01T00:00:00.000Z/2019-06-11T00:00:00.000Z',
            order: 'asc',
            orderBy: 'conversationStart'
        }
    })
}

function waitOnJobProcessing(id){
    // Initial state of job is PROCESSING
    // Wait every 2sec until job has READY state
    return new Promise((resolve, reject) => {
        let timer = setInterval(() => {
            recordingApi.getRecordingJob(id)
            .then((jobStatus) => {
                console.log(`State is ${jobStatus.state}.`)
                if(jobStatus.state == 'READY') {
                    resolve();
                    clearInterval(timer);
                }
            })
            .catch((e) => reject(e));
        }, 2000);
    });
}

function executeJob(id){
    return recordingApi.putRecordingJob(id, {
        state: 'PROCESSING'
    });
}

function getRecordingJobs(){
    return recordingApi.getRecordingJobs({
        pageSize: 25,
        pageNumber: 1,
        sortBy: 'userId', // or 'dateCreated'
        state: 'READY', // valid values FULFILLED, PENDING, READY, PROCESSING, CANCELLED, FAILED
        showOnlyMyJobs: true,
        jobType: 'EXPORT' // or 'DELETE'
    })
}
