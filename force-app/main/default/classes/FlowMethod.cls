public class FlowMethod {
    public class TaskRequest {
    @InvocableVariable(label='Contact Id')
    public Id contactId;

    @InvocableVariable(label='Subject')
    public String subject;

    @InvocableVariable(label='Due Date')
    public Date dueDate;
    
    }


   @InvocableMethod
   public static void CreateTask(List<TaskRequest> contacts){
       List<Task> tasksToCreate=new List<Task>();
       for(TaskRequest con:contacts){
           Task t = new Task();
           t.WhoId = con.contactId;
           t.Subject = con.subject;
           t.ActivityDate = con.dueDate;
           tasksToCreate.add(t);
       }
       if(!tasksToCreate.isEmpty()){
           insert tasksToCreate;
       }
  }
    
}