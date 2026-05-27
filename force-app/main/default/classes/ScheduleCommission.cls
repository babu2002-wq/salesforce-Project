public class ScheduleCommission implements Schedulable {
    public void execute(SchedulableContext sc) {
        MonthlyCommissionBatch batch = new MonthlyCommissionBatch();
        Database.executeBatch(batch);
    }
}