'use strict';

myAppModule.controller('applicant_dashboard_controller', function ($scope, $http, $timeout, $utils, $mdDialog, $interval, Upload, $localStorage) {
    $scope.application_menus = [
        { name : "Local Transport Permit", url : "#!/pages/application/wildlife/ltp" }
    ];

    $http.get(api_address + "?action=applicant/transaction/single&user_id=" + $scope.user.id ).then(function(data){
        $localStorage.my_applications = data.data.data;
    });

    $scope.open_application_status = function(x, event) {
        var s = $scope.getStatusCode(x.status);
        // s += " : " + ( (x.data.remark == undefined)? "": x.data.remark );
        if(x.status > 0)
            s += "| Received date: " + x.data.received.date;
        if(x.status == 2)
            s += "| Rejected date: " + x.data.rejected.date;
        if(x.status > 2)
            s += "| Accepted date: " + x.data.rejected.date;
        $scope.alert(x.name,s,event);
    };

    $scope.profile_checker = (user,event)=>{
        if(user.data.profile_picture == undefined){
            $scope.alert("Incomplete Profile","Please Upload your Profile Picture!",event);
            window.location = "#!/pages/profile";
        }
    }


});
