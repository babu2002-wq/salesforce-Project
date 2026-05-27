public class FlowRecordSerializer {
    public static void OpportunityTrigger(List<Opportunity> oppor){
        Set<Id> accounts=new Set<Id>();
        for(Opportunity opp:oppor){
            accounts.add(opp.AccountId);
        }
        
        List<Case> AllCases=[Select Id,Subject From Case WHERE AccountId IN:accounts];
        Map<Id,List<Case>> accounttoCase=new Map<Id,List<Case>>();
        for(Case Cas:AllCases){
            if(!accounttoCase.containsKey(Cas.AccountId)){
                accounttoCase.put(Cas.AccountId,new List<Case>());
            }
            accounttoCase.get(Cas.AccountId).add(Cas);
        }
        
        for(Opportunity opp:oppor){
            if(opp.AccountId!=null && accounttoCase.containsKey(opp.AccountId)){
                for(Case cases:accounttoCase.get(opp.AccountId)){
                    if(cases.Status!='Closed' && cases.CreatedDate <= System.now().addDays(-10)){
                        opp.addError('Opportunity cannot be created until all cases are closed');
                    }
                }
            }
        }
    }
}