'use strict';

myAppModule.controller('applicant_dashboard_controller', function ($scope, $http, $timeout, $utils, $mdDialog, $interval, Upload, $localStorage) {
    $scope.application_menus = [
        { name : "Local Transport Permit", url : "#!/pages/application/wildlife/ltp" }
    ];

    $scope.load_my_applications = ()=>{
        $http.get(api_address + "?action=applicant/transaction/single&user_id=" + $scope.user.id ).then(function(data){
            $localStorage.my_applications = data.data.data;
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
