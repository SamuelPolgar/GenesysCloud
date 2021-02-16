
let apiInstance = new platformClient.RoutingApi();

let queueArr = ["12345","12346"];

var alertingT = 18;                             // Set alerting time to 18 seconds
var inQueueFlowObj = {                          // Set the in queue flow
    "id": "12345",
    "name": "Generic In-Queue Flow",
    "selfUri": "/api/v2/flows/12345"
  };
var acwObj = {                                  // Set the wrap-up timeout to 30 seconds
    "wrapupPrompt": "MANDATORY_TIMEOUT",
    "timeoutMs": 30000
  };   

//Get the queue

function getQueue(inputId) {
  apiInstance.getRoutingQueue(inputId)
  .then((data) => {
    updateObj(data);
    console.log(`getRoutingQueueSuccess!data: ${JSON.stringify(data, null, 2)}`);
  })
  .catch((err) => {
    console.log('There was an error getting Queue');
    console.log(err);
  });
}

//Update queue objects

function updateObj(queueObj) {
  queueObj.acwSettings = acwObj;
  queueObj.queueFlow = inQueueFlowObj;
  queueObj.mediaSettings.call.alertingTimeoutSeconds = alertingT;
  let queueId = queueObj.id;
  console.log(`updated Queue Obj details! data: ${JSON.stringify(queueObj, null, 2)}`);
  console.log(`queue details: ${queueId}`);
  setQueue(queueId, queueObj);
}

//Send it back to GC

function setQueue(queueId, queueObj) {
  apiInstance.putRoutingQueue(queueId, queueObj)
  .then((data) => {
    console.log(`putRoutingQueue success! data: ${JSON.stringify(data, null, 2)}`);
  })
  .catch((err) => {
    console.log('Failure putRoutingQueue');
    console.log(err);
  })
}

queueArr.forEach(element => getQueue(element));
