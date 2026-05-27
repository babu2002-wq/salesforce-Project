public class BatchClass implements Database.Batchable<SObject>,Database.Stateful {
    public Integer recordsProcessed = 0;
    public Database.QueryLocator start(Database.BatchableContext bc){
        return Database.getQueryLocator('SELECT ID,Name,(SELECT ID,Department FROM Contacts) FROM Account');
    }
    
    public void execute(Database.BatchableContext bc,List<Account> scope){
        List<Contact> cont=new List<Contact>();
        for(Account acc:scope){
            for(Contact con:acc.Contacts){
                con.Department=acc.Name;
                con.AccountID=acc.Id;
                cont.add(con);
                recordsProcessed = recordsProcessed + 1;
            }
            update cont;
        }
        
    }
    
    public void finish(Database.BatchableContext bc){
        System.debug('Process Completed');
    }

}