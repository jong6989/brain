'use strict';

myAppModule.controller('single_controller', function ($scope, $http,$location, $timeout, $utils, $mdDialog, $interval, Upload, $localStorage) {
    $scope.is_loading = true;
    $scope.application = {};

    $scope.get_single_notif = (event)=>{
        var itemId = $location.search().id;
        $http.get(api_address + "?action=applicant/notification/get&user_id=" + $scope.user.id + "&id=" + itemId ).then(function(data){
            $scope.is_loading = false;
            if(data.data.status == 1){
                $scope.application = data.data.data;
            }else {
                $scope.alert("Page Error",data.data.error,event);
                window.location = "#!/pages/dashboard";
            }
        });
    }
    

});
