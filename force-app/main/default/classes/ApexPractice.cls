public class ApexPractice {
    public static void ChangeContact(List<Account> acc,Map<Id,Account> accmap){
        Set<Id> accIds=new Set<Id>();
        List<Contact> cont=new List<Contact>();
        for(Account acca:acc){
            Account oldrecord=accmap.get(acca.Id);
            if(acca.Rating=='Hot' && acca.Rating!=oldrecord.Rating){
                accIds.add(acca.Id);
            }
        }
        for(Contact con:[Select Id,GenderIdentity From Contact where AccountId IN:accIds]){
            con.GenderIdentity='Male';
            cont.add(con);
        }
        if(!cont.isEmpty()){
            update cont;
        }
    }
}