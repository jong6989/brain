'use strict';

myAppModule.controller('applicant_dashboard_controller', function ($scope, $http, $timeout, $utils, $mdDialog, $interval, Upload, $localStorage) {
    var my_applications = null;
    $scope.application_menus = [
        { name : "Local Transport Permit", url : "#!/pages/application/wildlife/ltp" },
        { name : "Wildlife Special Use Permit (RFF)", url : "#!/pages/application/wildlife/wsup_rff" },
        { name : "Wildlife Special Use Permit (AO12)", url : "#!/pages/application/wildlife/wsup_ao12" },
        { name : "Wildlife Collector's Permit", url : "#!/pages/application/wildlife/wcp" },
        { name : "Wildlife Farm Permit", url : "#!/pages/application/wildlife/wfp" }
    ];

    $scope.load_my_applications = ()=>{
        $http.get(api_address + "?action=applicant/transaction/single&user_id=" + $scope.user.id ).then(function(data){
            if(JSON.stringify(data.data.data) != my_applications){
                my_applications = JSON.stringify(data.data.data);
                $localStorage.my_applications = data.data.data;
            }
            $timeout(()=>{ $scope.load_my_applications();},4000);
        });
    };

    $scope.profile_checker = (user,event)=>{
        if(user.data.profile_picture == undefined){
            $scope.alert("Incomplete Profile","Please Upload your Profile Picture!",event);
            window.location = "#!/pages/profile";
        }
    }

    $scope.set_application = (x,ev)=>{
        $scope.application = x;
        $scope.showPrerenderedDialog(ev,'singleTransaction');
    }


});
