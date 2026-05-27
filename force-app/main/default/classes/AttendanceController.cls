public with sharing class AttendanceController {
    @AuraEnabled
public static Attendance__c clockIn() {
    Id currentUserId = UserInfo.getUserId();
    Attendance__c attendance = new Attendance__c(
        User__c = currentUserId,
        Clock_In_Time__c = System.now()
    );
    insert attendance;
    return attendance;
}

    
    @AuraEnabled
public static Attendance__c clockOut(Id attendanceId) {
    if (attendanceId == null) {
        throw new AuraHandledException('AttendanceId is required to clock out.');
    }

    Attendance__c attendance = [
        SELECT Id, Clock_In_Time__c, Clock_Out_Time__c
        FROM Attendance__c
        WHERE Id = :attendanceId
        LIMIT 1
    ];

    if (attendance.Clock_Out_Time__c != null) {
        throw new AuraHandledException('Already clocked out.');
    }

    DateTime clockOutTime = System.now();
    Long diffMillis = clockOutTime.getTime() - attendance.Clock_In_Time__c.getTime();

    Long totalSeconds = diffMillis / 1000;
    Long hours = totalSeconds / 3600;
    Long minutes = Math.mod((totalSeconds / 60), 60);
    Long seconds = Math.mod(totalSeconds, 60);

    String formattedTime = '';
    if (hours > 0) {
        formattedTime += hours + ' hr ';
    }
    if (minutes > 0 || hours > 0) {
        formattedTime += minutes + ' min ';
    }
    formattedTime += seconds + ' sec';

    attendance.Clock_Out_Time__c = clockOutTime;
    attendance.Total_Hours__c = formattedTime;
    update attendance;

    return attendance;
}

    
   @AuraEnabled(cacheable=true)
public static Attendance__c getLatestAttendance() {
    Id currentUserId = UserInfo.getUserId();

    List<Attendance__c> records = [
        SELECT Id, Clock_In_Time__c, Clock_Out_Time__c, Total_Hours__c
        FROM Attendance__c
        WHERE User__c = :currentUserId
        ORDER BY CreatedDate DESC
        LIMIT 1
    ];

    if (!records.isEmpty()) {
        return records[0];
    }
    return null;
}


}