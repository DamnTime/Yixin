
angular.module('iWebApp',['ionic','ngAnimate'])
    .config(function ($stateProvider,$urlRouterProvider,$ionicConfigProvider) {
        $ionicConfigProvider.tabs.position("bottom");

        $stateProvider
            .state('start', {
                url: '/start',
                templateUrl: 'tpl/start.html',
                controller:'startCtrl'
            })
            .state('index', {
                url: '/index',
                templateUrl: 'tpl/index.html',
                controller:'indexCtrl'
            })
            .state('cart', {
                url:'/cart',
                templateUrl: 'tpl/cart.html',
                controller:'cartCtrl'
            })
            .state('teacher', {
                url:'/teacher',
                templateUrl: 'tpl/teacher.html'
                //controller:'teacherCtrl'
            })
            .state('list', {
                url:'/list/:typeNum',
                templateUrl: 'tpl/list.html',
                controller:'listCtrl'
            })
            .state('detail', {
                url:'/detail/:cid',
                templateUrl: 'tpl/detail.html',
                controller:'detailCtrl'
            })
            .state('login', {
              url: '/login',
              templateUrl: 'tpl/login.html',
              controller: 'loginCtrl'
            })
            .state('register', {
                url:'/register',
                templateUrl: 'tpl/register.html',
                controller:'registerCtrl'
            });
        $urlRouterProvider.otherwise('start');
    })
    .controller('parentCtrl',
    ['$scope','$state','$ionicSideMenuDelegate','$ionicSlideBoxDelegate',
        '$ionicModal','$http','$rootScope',
        function ($scope,$state,$ionicSideMenuDelegate,$ionicSlideBoxDelegate,
                  $ionicModal,$http,$rootScope) {
            //跳转方法
            $scope.jump = function (arg) {
                $state.go(arg);
            };
            //弹出搜索框
            $ionicModal.fromTemplateUrl('modal.html', {
                scope: $scope,
                animation: 'slide-in-right'
            }).then(function(result) {
                $scope.modal = result;
            });
            $scope.search = function() {
                $scope.modal.show();
            };

            //根据页数和课程类型获取课程数据
            $scope.getCourseData = function(num,type){
                $scope.$broadcast('scroll.infiniteScrollComplete');
                $http.get('php/course_select.php?type='+ type + '&pageNum=' + num).success(
                    function(result){
                        $scope.courseData = result;
                    }
                );
            };

        }
    ])
    .controller('startCtrl',['$scope','$timeout','$interval','$state',
        function($scope,$timeout,$interval,$state){
            $scope.secondNumber = 5;
            $timeout(function(){
                $state.go('index');
            },5000);
            $interval(function(){
                if($scope.secondNumber>0)
                    $scope.secondNumber--;
            },1000);
        }])
    .controller('indexCtrl',['$scope','$http','$timeout',
        function($scope,$http){
            //轮播数据
            $scope.imgList = ['images/banner01.jpg','images/banner02.jpg',
                'images/banner03.jpg','images/banner04.jpg' ];

            //获取最新课程数据
            $http.get('php/ind_new_course.php').success(function(result){
                $scope.newCourseList = result;
            });

            //获取师资数据
            $http.get('php/teachers_select.php').success(function(result){
                //每一行显示3位讲师
                $scope.teacherList = [];
                for(var i=0;i<=result.length/3;i++){
                    $scope.teacherList[i] = [];
                    for(var j=0;j<3;j++){
                        $scope.teacherList[i][j] = result[i*3+j];
                    }
                }
            });
        }
    ])
    .controller('listCtrl',['$scope','$http','$stateParams','$rootScope','$timeout',
        function($scope,$http,$stateParams,$rootScope,$timeout){
            //获取所有类别数据
            $http.get('php/type_select.php').success(function(result){
                result.unshift({tpid:0,tpname:'不限'});
                $scope.courseTypeList = result;
            });
            //记载当前课程类型
            $rootScope.curType = $stateParams.typeNum || 0;
            //显示当前课程类型下的课程数据：此功能为多次调用的通用方法，定义到父控制器中
            $scope.$parent.getCourseData(1,$scope.curType);

            //加载更多功能
            $scope.hasMore = true;
            $scope.pageNum = 1;
            $scope.loadMore = function () {
                $scope.pageNum++;
                $timeout(function () {
                    $http.get('php/course_select.php?type='+ $rootScope.curType + '&pageNum=' + $scope.pageNum)
                        .success(function (newsData) {
                            if(newsData.data.length <3)
                            {
                                $scope.hasMore = false;
                            }
                            $scope.courseData.data = $scope.courseData.data.concat(newsData.data);

                            $scope.$broadcast('scroll.infiniteScrollComplete');
                        })
                },2000);
            };
        }])
    .controller('detailCtrl',['$scope','$http','$stateParams','$rootScope',
        function($scope,$http,$stateParams,$rootScope){
            //获取产品详细数据
            $http.get('php/course_detail.php?cid=' + $stateParams.cid).success(
                function(result){
                    $scope.course = result;
                }
            );
            //加入购物车
            $scope.addCart = function(){
                if(!$rootScope.uid){
                    $scope.$parent.jump('login');
                }else{
                    $http.get('php/cart_add.php?uid=' +
                    $rootScope.uid + '&cid=' + $stateParams.cid).success(
                        function (result) {
                            if(result.code==1){
                                console.log("添加成功！");
                            }
                        }
                    );
                }
            };
        }])
    .controller('loginCtrl',['$scope','$http','$rootScope',
        function($scope,$http,$rootScope){
            $scope.login = function() {
                $http.get('php/user_login.php?unameOrPhone=' +
                $scope.uname + '&upwd=' + $scope.pwd).success(
                    function (result) {
                        console.log(result);
                        if(result.code!=1){
                            $scope.error = "用户名或密码不正确";
                        }else{
                            $rootScope.isLogin = true;
                            $rootScope.uid= result.uid;
                            $rootScope.uname= result.uname;
                            $rootScope.phone= result.phone;
                            $scope.$parent.jump('cart');
                        }
                    }
                );
            }
        }
    ])
    .controller('userCtrl',['$scope',
        function($scope){
            $scope.data='456';
        }
    ])
    .controller('cartCtrl',['$scope',
        function($scope){
            $scope.data='456';
            //改变加减框的显示隐藏
            $scope.isShow=true;
            $scope.showHide=function(){
                $scope.isShow=false;
            };
            $scope.close=function(){
                $scope.isShow=true;
            };
        //    为加减添加单击事件
            $scope.count=1;
            $scope.add=function(){
                $scope.count++;
            };
            $scope.jian=function(){
                if($scope.count>1){
                    $scope.count--;
                }
            };
        }
    ])
    .controller('modalCtrl',['$scope',
        function($scope){
            //搜索
            $scope.$watch('kw', function () {
                if($scope.kw)
                {
                    //$http.get().success();
                    console.log($scope.kw);
                }
            })
    }])
    .controller('registerCtrl',['$scope','$http',function($scope,$http){
      $scope.mobileRegx = "^1(3[0-9]|4[57]|5[0-35-9]|7[01678]|8[0-9])\\d{8}$";
      var p=$scope.phone;
      console.log(p);
  }]);
