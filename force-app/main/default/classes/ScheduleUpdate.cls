public class ScheduleUpdate {
    public static void scheduleBatch() {
        String cronExpression = '0 0 0 * * ?'; 
        System.schedule('Daily Update Clicked Status', cronExpression, new UpdateClicked());
    }

}