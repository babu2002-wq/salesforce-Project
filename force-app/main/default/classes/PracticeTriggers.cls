public class PracticeTriggers {
        public static void updateAccounts(List<Contact> newCon) {
    Set<Id> accIds = new Set<Id>();
    Map<Id, List<Contact>> accMap = new Map<Id, List<Contact>>();
            List<Account> updates=new List<Account>();

    for (Contact con : newCon) {
        accIds.add(con.AccountId);
    }

    List<Contact> conList = [
        SELECT Id, Name, Department, AccountId
        FROM Contact
        WHERE AccountId IN :accIds
    ];

    for (Contact con : conList) {
        if(!accmap.containsKey(con.AccountId)){
            accMap.put(con.AccountId,new List<Contact>());
        }
        accMap.get(con.AccountId).add(con);
    }
            
            for(Contact con:newCon){
                if(accmap.containsKey(con.AccountId)){
                    Account acc=new Account(Id=con.AccountId);
                    acc.Name=con.Department;
                    updates.add(acc);
                }
            } 
            update updates;
            
            

    
}

}