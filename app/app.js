'use strict';

const api_address = "/api/";
const config = {
                    headers : {
                        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
                    }
                };

//set camera
function hasGetUserMedia() {
  return !!(navigator.mediaDevices &&
    navigator.mediaDevices.getUserMedia);
}

if (hasGetUserMedia()) {
  // Good to go!
} else {
  alert('getUserMedia() is not supported by your browser');
}

//initialize moment
moment().format("YYYY-MM-DD h:mm:ss");

var myAppModule = angular.module('brain_app', ['ngMaterial','ngAnimate', 'ngMessages','ngFileUpload','ngImgCrop','ngStorage','ngTable','ngRoute','camera'])

.factory("$utils",function($http, Upload,$filter){
   var f = {};
   f.api = function(q){
        $http.post(api_address, q.data)
        .then(function (data, status, headers, config) {
            if(q.callBack!==undefined) q.callBack(data);
        },function (data, status, header, config) {
            if(q.errorCallBack!==undefined) q.errorCallBack(data);
        });
    };
   return f;
})
.factory('Excel',function($window){
        var uri='data:application/vnd.ms-excel;base64,',
            template='<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--><style type="text/css"> .print-hide{display: none;} </style></head><body><table>{table}</table></body></html>',
            base64=function(s){return $window.btoa(unescape(encodeURIComponent(s)));},
            format=function(s,c){return s.replace(/{(\w+)}/g,function(m,p){return c[p];})};
        return {
            tableToExcel:function(tableId,worksheetName){
                var table=$(tableId),
                    ctx={worksheet:worksheetName,table:table.html()},
                    href=uri+base64(format(template,ctx));
                return href;
            },
            getExcel:function(input_id){
                  /*Checks whether the file is a valid excel file*/
                  var generatedReport = [];
                   var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.xlsx|.xls)$/;
                   var xlsxflag = false; /*Flag for checking whether excel is .xls format or .xlsx format*/  
                   if ($("#" + input_id).val().toLowerCase().indexOf(".xlsx") > 0) {  
                     xlsxflag = true;  
                    } 
                    console.log(xlsxflag);
                   var reader = new FileReader();  
                   reader.onload = function (e) {  
                     var data = e.target.result;  
                     if (xlsxflag) {  
                       var workbook = XLSX.read(data, { type: 'binary' });  
                     }  
                     else {  
                        var workbook = XLS.read(data, { type: 'binary' });  
                     }    
                     
                     var sheet_name_list = workbook.SheetNames;  
                     var cnt = 0; 
                     sheet_name_list.forEach(function (y) { /*Iterate through all sheets*/  
                       
                       if (xlsxflag) {  
                         var exceljson = XLSX.utils.sheet_to_json(workbook.Sheets[y]);  
                       }  
                       else {  
                         var exceljson = XLS.utils.sheet_to_row_object_array(workbook.Sheets[y]);  
                       }   
                       if (exceljson.length > 0) {  
                         for (var i = 0; i < exceljson.length; i++) {  
                              generatedReport.push(exceljson[i]);  
                              // $scope.$apply();  
                         }  
                       }  
                     });  
                   }  
                   if (xlsxflag) {
                     reader.readAsArrayBuffer($("#" + input_id)[0].files[0]);  
                   }  
                   else {  
                     reader.readAsBinaryString($("#" + input_id)[0].files[0]);  
                   }
                return generatedReport;
            }
        };
    })


.controller('AppCtrl', function ($scope,$window,$filter, $http,$timeout, $mdSidenav, $log, $utils, $mdToast,$localStorage , $sessionStorage, $mdDialog, Excel, NgTableParams,$route, $routeParams, $location) {
    $scope.$route = $route;
    $scope.$routeParams = $routeParams;
    $scope.$location = $location;
    $scope.$localStorage = $localStorage;
    $scope.page_title = "";
    $scope.current_view = "";
    $scope.content_page = "";
    $scope.active_menu = "";
    $scope.menus = [];
    $scope.notifs = [];
    $scope.api_address = api_address;

    $scope.toggleLeft = buildDelayedToggler('left');
    $scope.toggleRight = buildToggler('right');


    $scope.ngTable = function(d,c){
      if(c == undefined) c=5;
      return new NgTableParams({count:c}, { dataset: d});
    };

    $scope.load_table = (data,tbl,c)=>{
      if(c == undefined) c=5;
      tbl = new NgTableParams({count:c}, { dataset: data})
      return tbl;
    };

    $scope.to_date = function(d){
      return $filter('date')(d, "yyyy-MM-dd");
    };

    $scope.isOpenRight = function(){
      return $mdSidenav('right').isOpen();
    };

    $scope.date_gap = function(a,b){
      var a = moment(b);
      return a.from(a);
    };

    $scope.within_dates = function(date,from,to){
      var d = $scope.to_date(date);var a = $scope.to_date(from);var b = $scope.to_date(to);
      var aa = a.split("-");
      var ya = parseInt(aa[0]);
      var ma = parseInt(aa[1]);
      var da = parseInt(aa[2]);
      var bb = b.split("-");
      var yb = parseInt(bb[0]);
      var mb = parseInt(bb[1]);
      var db = parseInt(bb[2]);
      var xx = d.split("-");
      var yx = parseInt(xx[0]);
      var mx = parseInt(xx[1]);
      var dx = parseInt(xx[2]);
      var dir = (ya < yb)?1:( (ya > yb)? -1: ( ma < mb )?1: ( (ma > mb)?-1: ( (da < db)?1: ( (da > db)? -1:1 ) ) ) );
      if( ya > yx && yb > yx ) return false;
      if( ya < yx && yb < yx ) return false;

      if( ya === yx || yb === yx){
        if(dir === 1 && ya === yx){
          if( mx < ma ) return false;
        }
        if(dir === 1 && yb === yx){
          if( mx > mb ) return false;
        }
        if(dir === -1 && yb === yx){
          if( mx < mb ) return false;
        }
        if(dir === -1 && ya === yx){
          if( mx > ma ) return false;
        }
        if( ma === mx || mb === mx){
          if(dir === 1 && ma === mx){
            if( dx < da ) return false;
          }
          if(dir === -1 && mb === mx){
            if( dx < db ) return false;
          }
          if(dir === -1 && ma === mx){
            if( dx > da ) return false;
          }
          if(dir === 1 && mb === mx){
            if( dx > db ) return false;
          }
          return true;
        }else {
          return true;
        }
      }else {
        return true;
      }
    };

    $scope.import_report = function(id){
        return Excel.getExcel(id,$scope);
    };

    $scope.get_window_height = function(){
      return $(window).height();
    };

    $scope.printDiv = function (elementId) {
        var printContents = document.getElementById(elementId).innerHTML;
        var originalContents = document.body.innerHTML;      

        if (navigator.userAgent.toLowerCase().indexOf('chrome') > -1) {
            var popupWin = window.open('', '_blank', 'width=1200,height=500,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
            popupWin.window.focus();
            popupWin.document.write('<!DOCTYPE html><html><head>' +
                '<link href="css/angular-material.min.css" rel="stylesheet">' +
                '<link href="plugins/bootstrap/4.1.1/bootstrap.min.css" rel="stylesheet"><style type="text/css"> .print-hide{display: none;} </style>' +
                '</head><body onload="window.print()"><div class="reward-body">' + printContents + '</div></html>');
            popupWin.onbeforeunload = function (event) {
                popupWin.close();
                return '.\n';
            };
            popupWin.onabort = function (event) {
                popupWin.document.close();
                popupWin.close();
            }
        } else {
            var popupWin = window.open('', '_blank', 'width=1200,height=500');
            popupWin.document.open();
            popupWin.document.write('<html><head><link href="css/angular-material.min.css" rel="stylesheet"><link href="plugins/bootstrap/4.1.1/bootstrap.min.css" rel="stylesheet">'+
              '<style type="text/css"> .print-hide{display: none;} </style></head><body onload="window.print()">' + printContents + '</html>');
            popupWin.document.close();
        }
        popupWin.document.close();

        return true;
    };

    $scope.table_to_excel = function(elementId,fileName){
      var blob = new Blob([document.getElementById(elementId).innerHTML], {
              type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
          });
      saveAs(blob, fileName + ".xls");
    };

    $scope.exportToExcel = function(Id,title){ 
        var exportHref=Excel.tableToExcel("#"+Id,title);
        $timeout(function(){location.href=exportHref;},100); // trigger download
    };
    $scope.date_from_now = function(a){
      var a = moment(a);
      return a.fromNow();
    };

    $scope.date_now = function(){
      return moment().format("YYYY-MM-DD");
    };

    $scope.toast = function(t){
      $mdToast.show(
        $mdToast.simple()
          .textContent(t)
          .hideDelay(4000)
      );
    };

    $scope.update_selected_account = function(d,u){
      var q = { 
        data : { 
          action : "account/update",
          id : d.id,
          name : d.name,
          password : d.password,
          data : d.data,
          user_level : d.user_level,
          user_id : $scope.user.id
        },
        callBack : function(data){
          if(data.data.status == 0){
            $scope.toast(data.data.error + "  : " + data.data.hint);
          }else {
            $scope.toast(data.data.data);
            if(u){
              $scope.user = $localStorage.csls_user = d;
              $mdSidenav('right').close();
            }else {
              $scope.get_accounts();
              $scope.is_single_account_selected = false;
            }
              
          }
        }
      };
      $utils.api(q);
    };

    $scope.login_attempt = function(d){
      var q = { 
        data : { 
          action : "applicant/account/login",
          name : d.name,
          password : d.password
        },
        callBack : function(data){
          if(data.data.status == 0){
            $scope.toast(data.data.error + "  : " + data.data.hint);
          }else {
            $scope.current_view = $localStorage.brain_current_view = data.data.data.main_view;
            $localStorage.brain_content_page = data.data.data.page_content;
            $scope.user = $localStorage.brain_app_user = data.data.data.user;
            $localStorage.brain_menus = data.data.data.menus;
            $scope.menus = data.data.data.menus;
            $location.path("/"+ data.data.data.page_content);
          }
        }
      };
      $utils.api(q);
    };

    $scope.logout = function(){
      $scope.current_view = "app/login/view.html";
      $scope.content_page = "";
      $localStorage.brain_current_view = undefined;
      $localStorage.brain_content_page = undefined;
      $localStorage.brain_app_user = undefined;
    };

    $scope.set_page_title = function(t){
      $scope.page_title = t;
    };

    $scope.isActive = function (path) {
      return ($location.path().substr(0, path.length) === path) ? true : false;
    }

    $scope.showPrerenderedDialog = function(ev,ID) {
      $mdDialog.show({
        contentElement: '#' + ID,
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose: true
      });
    };
    $scope.close_dialog = function(){
      $mdDialog.cancel();
    };

    function debounce(func, wait, context) {
      var timer;

      return function debounced() {
        var context = $scope,
            args = Array.prototype.slice.call(arguments);
        $timeout.cancel(timer);
        timer = $timeout(function() {
          timer = undefined;
          func.apply(context, args);
        }, wait || 10);
      };
    }

    function buildDelayedToggler(navID) {
      return debounce(function() {
        $mdSidenav(navID)
          .toggle()
          .then(function () {
            $log.debug("toggle " + navID + " is done");
          });
      }, 200);
    }

    function buildToggler(navID) {
      return function() {
        $mdSidenav(navID)
          .toggle()
          .then(function () {
            $log.debug("toggle " + navID + " is done");
          });
      };
    }

    $scope.close_left_side = function () {
      $mdSidenav('left').close()
        .then(function () {
          $log.debug("close LEFT is done");
        });

    };

    $scope.run_initials = function(){
      if($localStorage.brain_app_user !== undefined && $localStorage.brain_current_view !== undefined && $localStorage.brain_content_page !== undefined){
        $scope.current_view = $localStorage.brain_current_view;
        $scope.user = $localStorage.brain_app_user;
        $scope.menus = $localStorage.brain_menus;
        $location.path("/"+ $localStorage.brain_content_page);

      }else{
        $scope.current_view = "app/login/view.html";
      }
    };

    $scope.iframeHeight = $scope.get_window_height();
    angular.element($window).bind('resize',function(){
      $scope.iframeHeight = $window.innerHeight;
      // $scope.$digest();
    });

    $scope.getUserType = function(n){
      if(n==99)return "Admin";
      if(n==0)return "Applicant";
      if(n==1)return "Partner";
      if(n==2)return "PCSD Staff";
    };

    $scope.getStatusCode = function(n){
      if(n==0)return "Submitted";
      if(n==1)return "Received, Reviewing";
      if(n==2)return "Rejected";
      if(n==3)return "Accepted, On Process";
    };

    $scope.alert = (title,text,event)=>{
      $mdDialog.show(
        $mdDialog.alert()
          .title(title)
          .textContent(text)
          .ariaLabel(title)
          .ok('close')
          .targetEvent(event)
      );
    }

    $scope.load_notifs = ()=>{
      $http.get(api_address + "?action=applicant/notification/load&user_id=" + $scope.user.id ).then(function(data){
        return $scope.notifs = (data.data.status == 1) ? data.data.data : [];
      });
    }

  
    $timeout(()=> {
      start_particles(); 
    }, 100);
})


.config(function($routeProvider, $locationProvider) {
  $routeProvider.when('/:name*', {
            templateUrl: function(urlattr){
                return 'app/' + urlattr.name + '/view.html';
            }
        })
  .otherwise({ redirectTo: '/' });

})



;