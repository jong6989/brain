'use strict';

myAppModule.controller('application_controller', function ($scope, $http, $timeout, $utils, $mdDialog, $interval, Upload, $localStorage) {
    $scope.selectedIndex = 0;
    $scope.mun = [];
    $scope.places_of_transport = [];
    $scope.shippers_name = [$scope.user.data.full_name];
    $scope.shippers_address = [$scope.user.data.current_address];
    $scope.uploading_file = false;
    $scope.is_loading = false;
    $scope.is_uploading = false;
    $scope.photo_uploading_rate = 0;
    $scope.picFile = null;
    $scope.is_using_camera = false;

    $scope.clear_cropping_image = ()=>{
        $scope.picFile = null;
    }

    $scope.toggle_using_camera = ()=>{
        $scope.is_using_camera = !$scope.is_using_camera;
    }

    $scope.is_croping_image = ()=>{
        return ($scope.picFile == null) ? false : true;
    };

    $scope.upload_process = ()=>{
        return Upload.isUploadInProgress();
    }

    $scope.upload_photo = function(dataUrl, name){
        $scope.is_using_camera = false;
        Upload.upload({
            url: api_address,
            data: {
                action:"applicant/account/upload_photo",
                user_id : $scope.user.id,
                file: Upload.dataUrltoBlob(dataUrl, name)
            }
        }).then(function (data) {
            if(data.data.status == 1){
                $scope.new_application.applicant_photo = data.data.data;
            }
        }, null, function (evt) {
            $scope.photo_uploading_rate = parseInt(100.0 * evt.loaded / evt.total);
        });
    };

    // $scope.organization_list = ['Fisherman Association','mangingisda ng Palawan','Business Owners Palawan'];

    //initialize data
    $http.get(api_address + "json/permitting/specimen_classification.json").then(function(data){
        $scope.specimen_quality_list = data.data.data; 
    });

    $http.get(api_address + "json/permitting/organizations.json").then(function(data){
        $scope.organization_list = data.data.data; 
    });

    $http.get(api_address + "json/permitting/rff_specimen.json").then(function(data){
        $scope.rff_specimen_list = data.data.data; 
    });

    $http.get(api_address + "json/permitting/permit_types.json").then(function(data){
        $scope.permit_types = data.data.data;
    });

    $scope.change_current_index = (n)=>{
        $scope.selectedIndex = n;
    };

    $http.get(api_address + "json/profile/municipality.json").then(function(data){
        $scope.municipalities = data.data.data;
    });

    $http.get(api_address + "json/profile/nationalities.json").then(function(data){
        $scope.nationalities = data.data.data; 
    });

    $http.get(api_address + "json/profile/purpose_of_transport.json").then(function(data){
        $scope.other_purpose = data.data.data;
    });

    $http.get(api_address + "json/profile/place_of_transport.json").then(function(data){
        angular.forEach(data.data.data, function(value, key) {
            $scope.places_of_transport.push(value.name);
        });
    });


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

    $scope.myDate = new Date();

    $scope.minDate = new Date(
        $scope.myDate.getFullYear() - 90,
        $scope.myDate.getMonth(),
        $scope.myDate.getDate()
    );

    $scope.maxDate = new Date(
        $scope.myDate.getFullYear() - 18,
        $scope.myDate.getMonth(),
        $scope.myDate.getDate()
    );

    $scope.set_permit_type = (x)=>{$scope.new_application.required_permit_type = x;};

    $scope.set_municipality = function(mun){
        $scope.mun = mun;
        $scope.new_application.place_of_origin.barangay = null;
    };

    $scope.submit_application = function(application,key){
        //required a 2 x 2 Photo
        if($scope.new_application.applicant_photo == 'images/user.png'){
            $scope.toast("Please upload a photo!");
            return null;
        }
        //name must be complete
        let ap_name = application.applicant.split(' ');
        if(ap_name.length < 3){
            $scope.toast("Apllicant Name is invalid!, Check your middle name.");
            return null;
        }
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
