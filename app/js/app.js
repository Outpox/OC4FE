(function () {
    angular.module('oc4fe', ['ngMaterial', 'ngRoute', 'ngResource'])
        .factory('Data', function () {
            return {
                payeur: '',
                date: new Date().setHours(0, 0, 0, 0),
                loading: false,
                presents: [],
                nbCafe: 0
            }
        })
        .factory('People', ['$resource', function ($resource) {
            return $resource('http://localhost:3000/users/:id', null, {
                update: {
                    method: 'PUT' // this method issues a PUT request
                }
            });
        }])
        .factory('Tools', function () {
            return {
                jourDiff: function (date1) {
                    var date2 = new Date().setHours(0, 0, 0, 0);
                    var diff = {};                    // Initialisation du retour
                    var tmp = date2 - date1;
                    tmp = Math.floor(tmp / 1000);             // Nombre de secondes entre les 2 dates
                    diff.sec = tmp % 60;                    // Extraction du nombre de secondes
                    tmp = Math.floor((tmp - diff.sec) / 60);    // Nombre de minutes (partie entière)
                    diff.min = tmp % 60;                    // Extraction du nombre de minutes
                    tmp = Math.floor((tmp - diff.min) / 60);    // Nombre d'heures (entières)
                    diff.hour = tmp % 24;                   // Extraction du nombre d'heures
                    tmp = Math.floor((tmp - diff.hour) / 24);   // Nombre de jours restants
                    diff.day = tmp;
                    return diff.day;
                }
            }
        })
        .controller('toolbarCtrl', ['$scope', '$location', 'People', 'Data', '$mdBottomSheet', function ($scope, $location, People, Data, $mdBottomSheet) {
            $scope.people = People;
            $scope.data = Data;
            $scope.index = function () {
                $location.path('/');
                $scope.data.payeur = {};
                for (var p in $scope.people) {
                    $scope.people[p].present = false;
                    $scope.people[p].payeAjd = false;
                }
            };
            $scope.showGridBottomSheet = function () {
                $mdBottomSheet.show({
                    templateUrl: 'view/bottom-sheet-action.html',
                    controller: 'menuCtrl'
                });
            };
        }])
        .controller('menuCtrl', ['$scope', '$location', '$mdBottomSheet', function ($scope, $location, $mdBottomSheet) {
            $scope.addNewUser = function () {
                $mdBottomSheet.hide();
                $location.path('/newuser');
            };
            $scope.editUser = function () {
                $mdBottomSheet.hide();
                $location.path('/userlist');
            };
            $scope.userInfo = function () {
                $mdBottomSheet.hide();
                $location.path('/userinfolist');
            }
        }])
        .controller('listCtrl', ['$scope', '$location', 'People', 'Data', 'Tools', function ($scope, $location, People, Data, Tools) {
            var tools = Tools;
            People.query(function (data) {
                $scope.people = data;
                for (var p in $scope.people) {
                    $scope.people[p].joursDepuisDernierCafe = tools.jourDiff(new Date($scope.people[p].dernierCafe));
                }
            });

            $scope.Data = Data;

            $scope.presents = function (person) {
                if (person.vacances) return;
                $scope.Data.payeur = person;
                $location.path('/presents');
            };
        }])
        .controller('presentsCtrl', ['$scope', '$location', 'People', 'Data', function ($scope, $location, People, Data) {
            People.query(function (data) {
                $scope.people = data;
            });
            $scope.data = Data;

            $scope.checked = function (person) {
                return (person.id === $scope.data.payeur.id);
            };

            $scope.selectAll = function () {
                for (var p in $scope.people) {
                    $scope.people[p].present = (!$scope.people[p].cachee && !$scope.people[p].vacances);
                }
            };
            $scope.goToSucre = function () {
                $scope.data.nbCafe = 0;
                $scope.people.forEach(function (user) {
                    if (user.present) {
                        $scope.data.nbCafe++;
                        $scope.data.presents.push(user);
                        if (user.id !== $scope.data.payeur.id) {
                            var p = People.query({id: user.id}, function () {
                                var us = p[0];
                                us.cafeRecus++;
                                us.dernierCafe = new Date().setHours(0, 0, 0, 0);
                                us.$update({id: us.id});
                            });
                        }
                    }
                });
                var p = People.query({id: $scope.data.payeur.id}, function () {
                    var us = p[0];
                    us.cafePayes += $scope.data.nbCafe;
                    us.$update({id: us.id}, function () {
                        $location.path('/sucre');
                    });
                });
            };
        }])
        .controller('sucreCtrl', ['$scope', 'Data', function ($scope, Data) {
            $scope.data = Data;
            $scope.data.payeur.dernierCafe = new Date();
            $scope.data.qteSucre = $scope.data.qteTouillette = 0;
            $scope.data.presents.forEach(function (user) {
                if (user.sucre) $scope.data.qteSucre++;
                if (user.touillette) $scope.data.qteTouillette++;
            });
        }])
        .controller('userCtrl', ['$scope', '$routeParams', 'People', 'Tools', function ($scope, $routeParams, People, Tools) {
            var tools = Tools;
            $scope.$route = $routeParams;
            var user = People.query({id: Number($scope.$route.id)}, function () {
                $scope.person = user[0];
                $scope.person.joursDepuisDernierCafe = tools.jourDiff(new Date($scope.person.dernierCafe));
                $scope.person.textSucre = $scope.person.sucre ? "Prend du sucre" : "Ne prend pas de sucre";
                $scope.person.textTouillette = $scope.person.touillette ? "Prend une touillette" : "Ne prend pas de touillette";
                $scope.person.textVacances = $scope.person.vacances ? "Est en vacances" : "N'est pas en vacances";
                $scope.person.textCachee = $scope.person.cachee ? "Est cachée de la liste" : "Est visible dans la liste";
            });
        }])
        .controller('newUserCtrl', ['$scope', 'People', 'Data', '$location', function ($scope, People, Data, $location) {
            People.query(function (data) {
                $scope.people = data;
            });
            $scope.data = Data;
            $scope.submit = function () {
                var person = new People();
                person.id = $scope.people.length + 1;
                person.prenom = $scope.prenom;
                person.img = $scope.img || 'img/account-circle.svg';
                person.dernierCafe = new Date().setHours(0, 0, 0, 0);
                person.joursDepuisDernierCafe = 0;
                person.payeAjd = false;
                person.present = false;
                person.sucre = $scope.sucre;
                person.touillette = $scope.touillette;
                person.vacances = false;
                person.cachee = false;
                person.cafePayes = 0;
                person.cafeRecus = 0;
                person.$save(function (resp, respHeader) {
                    $location.path('/');
                });
            }
        }])
        .controller('userListCtrl', ['$scope', 'People', 'Data', '$location', function ($scope, People, Data, $location) {
            People.query(function (data) {
                $scope.people = data;
            });
            $scope.data = Data;

            for (var p in $scope.people) {
                $scope.people[p].text = '';
                if ($scope.people[p].cachee && $scope.people[p].vacances) {
                    $scope.people[p].text = '(caché, en vacances)';
                    break;
                }
                if ($scope.people[p].cachee) {
                    $scope.people[p].text = '(caché)';
                    break;
                }
                if ($scope.people[p].vacances) {
                    $scope.people[p].text = '(en vacances)';
                    break;
                }
            }

            $scope.userInfo = function (id) {
                $location.path('/user/' + id);
            };
            $scope.editUser = function (id) {
                $location.path('edituser/' + id);
            };
        }])
        .controller('editUserCtrl', ['$scope', 'People', 'Data', '$location', '$routeParams', function ($scope, People, Data, $location, $routeParams) {
            $scope.$route = $routeParams;
            var user = People.query({id: Number($scope.$route.id)}, function () {
                $scope.people = user[0];
                $scope.data = Data;
                $scope.prenom = $scope.people.prenom;
                $scope.sucre = $scope.people.sucre;
                $scope.touillette = $scope.people.touillette;
                $scope.vacances = $scope.people.vacances;
                $scope.cachee = $scope.people.cachee;
                $scope.img = $scope.people.img;
                $scope.cafeRecus = $scope.people.cafeRecus;
                $scope.cafePayes = $scope.people.cafePayes;

                $scope.submit = function () {
                    $scope.people.prenom = $scope.prenom;
                    $scope.people.sucre = $scope.sucre;
                    $scope.people.touillette = $scope.touillette;
                    $scope.people.vacances = $scope.vacances;
                    $scope.people.cachee = $scope.cachee;
                    $scope.people.img = $scope.img || 'img/account-circle.svg';
                    $scope.people.cafePayes = $scope.cafePayes;
                    $scope.people.cafeRecus = $scope.cafeRecus;

                    $scope.people.$update({id: $scope.people.id}, function (resp, respHeader) {
                        if (resp.message === "OK") {
                            $location.path('/');
                        }
                    });
                }
            });
        }])
        .config(['$routeProvider', '$locationProvider', '$mdThemingProvider', function ($routeProvider, $locationProvider, $mdThemingProvider) {
            $mdThemingProvider.theme('default').primaryPalette('brown');
            $routeProvider
                .when('/', {
                    templateUrl: 'view/index.html',
                    controller: 'listCtrl'
                })
                .when('/presents', {
                    templateUrl: 'view/presents.html',
                    controller: 'presentsCtrl'
                })
                .when('/sucre', {
                    templateUrl: 'view/sucre.html',
                    controller: 'sucreCtrl'
                })
                .when('/user/:id', {
                    templateUrl: 'view/user.html',
                    controller: 'userCtrl'
                })
                .when('/newuser', {
                    templateUrl: 'view/newuser.html',
                    controller: 'newUserCtrl'
                })
                .when('/userlist', {
                    templateUrl: 'view/userlist.html',
                    controller: 'userListCtrl'
                })
                .when('/userinfolist', {
                    templateUrl: 'view/userinfolist.html',
                    controller: 'userListCtrl'
                })
                .when('/edituser/:id', {
                    templateUrl: 'view/edituser.html',
                    controller: 'editUserCtrl'
                });
            $locationProvider.html5Mode(true);
        }])
        .run(function ($rootScope, Data) {
            $rootScope.data = Data;
            $rootScope.$on('$routeChangeStart', function () {
                $rootScope.data.loading = true;
            });
            $rootScope.$on('$routeChangeSuccess', function () {
                $rootScope.data.loading = false;
            });
        });
}());