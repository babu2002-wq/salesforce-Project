public class PracticeSOQL {
    public static void OpportunityHandler(List<Opportunity> newopps,Map<Id,Opportunity> oldopps){
        Set<Id> acctids=new Set<Id>();
        Map<Id,Integer> totalopps=new Map<Id,Integer>();
        Map<Id,Account> accmap=new Map<Id,Account>();
        for(Opportunity opp:newopps){
            acctids.add(opp.AccountId);
        }
        
        for(Account acc:[Select Id,Name from Account where Id IN:acctids]){
            accmap.put(acc.Id,acc);
        }
        
        for(AggregateResult agg:[Select Count(Id) cnt,AccountId from Opportunity where AccountId IN:acctids GROUP BY AccountId]){
            totalopps.put((Id)agg.get('AccountId'),(Integer)agg.get('cnt'));
        }
        
        for(Opportunity opp:newopps){
            if(totalopps.get(opp.AccountId)>3){
                opp.addError('3 opp are already there');
            }
        }
        
        
    }
}