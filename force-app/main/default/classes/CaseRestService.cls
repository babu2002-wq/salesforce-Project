@RestResource(urlMapping='/cases/*')
global with sharing class CaseRestService {

    // CREATE CASE
    @HttpPost
    global static String createCase() {
        RestRequest req = RestContext.request;
        String body = req.requestBody.toString();

        CaseWrapper data = (CaseWrapper) JSON.deserialize(body, CaseWrapper.class);

        Case c = new Case(
            Subject = data.subject,
            Description = data.description,
            Status = data.status,
            Origin = 'API'
        );
        insert c;

        return JSON.serialize(new ResponseWrapper('SUCCESS', c.Id));
    }

    // UPDATE CASE
    @HttpPut
    global static String updateCase() {
        RestRequest req = RestContext.request;
        String body = req.requestBody.toString();

        CaseWrapper data = (CaseWrapper) JSON.deserialize(body, CaseWrapper.class);

        Case c = new Case(
            Id = data.caseId,
            Subject = data.subject,
            Description = data.description,
            Status = data.status
        );
        update c;

        return JSON.serialize(new ResponseWrapper('UPDATED', c.Id));
    }

    // GET CASE
    @HttpGet
    global static String getCase() {
        String caseId = RestContext.request.requestURI.substringAfterLast('/');

        Case c = [
            SELECT Id, Subject, Description, Status
            FROM Case WHERE Id = :caseId
        ];

        return JSON.serialize(c);
    }

    // WRAPPERS
    global class CaseWrapper {
        public String caseId;
        public String subject;
        public String description;
        public String status;
    }

    global class ResponseWrapper {
        public String message;
        public String caseId;

        public ResponseWrapper(String msg, String id) {
            message = msg;
            caseId = id;
        }
    }
}