'use strict';

myAppModule.controller('application_controller', function ($scope, $http, $timeout, $utils, $mdDialog, $interval, Upload, $localStorage) {
    $scope.selectedIndex = 0;
    $scope.mun = [];
    $scope.places_of_transport = [];
    $scope.shippers_name = [$scope.user.data.full_name];
    $scope.shippers_address = [$scope.user.data.current_address];
    $scope.uploading_file = false;
    $scope.is_loading = false;

    //initialize data
    $http.get(api_address + "json/permitting/specimen_classification.json").then(function(data){
        $scope.specimen_quality_list = data.data; 
    });

    $http.get(api_address + "json/permitting/rff_specimen.json").then(function(data){
        $scope.rff_specimen_list = data.data; 
    });

    $scope.change_current_index = (n)=>{
        $scope.selectedIndex = n;
    };

    $http.get(api_address + "json/profile/municipality.json").then(function(data){
        $scope.municipalities = data.data;
    });

    $http.get(api_address + "json/profile/purpose_of_transport.json").then(function(data){
        $scope.other_purpose = data.data;
    });

    $http.get(api_address + "json/profile/place_of_transport.json").then(function(data){
        angular.forEach(data.data, function(value, key) {
            $scope.places_of_transport.push(value.name);
        });
    });

    $scope.permit_types = [
        {name : "Wildlife Special Use Permit",code: "WSUP"},
        {name : "Wildlife Farm Permit",code: "WFP"},
        {name : "Wildlife Collectors Permit",code: "WCP"},
        {name : "Grautitiuos Permit",code: "GP"}
    ];

    $scope.initData = function(){
        $scope.new_application = "";
        $scope.new_application = {};
        $scope.new_application.applicant = $scope.user.data.full_name;
        $scope.new_application.contact = $scope.user.data.current_phone;
        $scope.new_application.attachments = [];
        $scope.new_application.mode = "online";
        $scope.new_application.temporary_id = "";
        $scope.new_application.status = "pending";
    };

    $scope.set_permit_type = (x)=>{$scope.new_application.required_permit_type = x;};

    $scope.set_municipality = function(mun){
        $scope.mun = mun;
        $scope.new_application.place_of_origin.barangay = null;
    };

    $scope.submit_application = function(application,key){
        $scope.is_loading = true;
        var q = { 
            data : {
                action : "applicant/transaction/create",
                user_id : $scope.user.id,
                name : key,
                data : { application : application }
            },
            callBack : function(data){
                $scope.is_loading = false;
                if(data.data.status == 0){
                    $scope.toast(data.data.error + "  : " + data.data.hint);
                }else {
                    $scope.toast(" Transaction Started, Please Wait for a responce within 3 days... Your Transaction ID is :  " + data.data.data);
                    $scope.selectedIndex = 0;
                    $scope.initData();
                }
            }
        };
        $utils.api(q);
    };

    $scope.upload_attachments = (fs)=>{
        var upload_file = (idx)=>{
            $scope.uploading_file = true;
            Upload.upload({
                url: api_address,
                data: {
                    action:"applicant/account/upload_attachments",
                    file: fs[idx],
                    user_id : $scope.user.id
                }
            }).then(function (data) {
                $scope.uploading_file = false;
                if(fs.length == (idx + 1) ){
                    $scope.user = $localStorage.brain_app_user = data.data.data.user;
                    $scope.new_application.attachments.push({
                        name: data.data.data.file_name,
                        url : data.data.data.url
                    })
                }else {
                    upload_file(idx + 1);
                }
            });
        };
        if(fs.length > 0 ) upload_file(0);
    };

    $scope.is_on_file_list = (item,list)=>{
        for (var i = 0; i < list.length; i++) {
            if(list[i] == item) return true;
        };
        return false;
    }

});
