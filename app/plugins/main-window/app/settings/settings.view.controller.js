'use strict';

angular.module('globalServices')
    .controller('SettingsViewController', function ($rootScope, $scope, $mdDialog, workSettingsData,
                                                    analyserSettingsData,
                                                    SettingsService, TrackItemService) {
        var ctrl = this;

        if (_.isEmpty(workSettingsData)) {
            ctrl.workSettings = {};
        } else {
            ctrl.workSettings = workSettingsData;
        }

        ctrl.workSettings.workDayStartTime = workSettingsData.workDayStartTime || '08:30';
        ctrl.workSettings.workDayEndTime = workSettingsData.workDayEndTime || '17:00';
        ctrl.workSettings.splitTaskAfterIdlingForMinutes = workSettingsData.splitTaskAfterIdlingForMinutes || 3;

        ctrl.analyserTestItems = [];

        if (_.isEmpty(analyserSettingsData)) {
            ctrl.analyserSettings = [];
        } else {
            ctrl.analyserSettings = analyserSettingsData
        }

        var todaysTrackItems;

        var startDate = moment();
        startDate.startOf('day');
        TrackItemService.findAllFromDay(startDate.toDate(), 'AppTrackItem').then(function (items) {
            console.log(items);
            todaysTrackItems = items;
            $scope.$apply();
        });

        //public methods
        ctrl.saveSettings = saveSettings;
        ctrl.testAnalyserItem = testAnalyserItem;
        ctrl.removeAnalyserItem = removeAnalyserItem;
        ctrl.addNewAnalyserItem = addNewAnalyserItem;

        function saveSettings() {
            console.log("Saving:", ctrl.workSettings, ctrl.analyserSettings);
            SettingsService.updateByName('WORK_SETTINGS', ctrl.workSettings).then(function (item) {
                console.log("Updated WORK_SETTINGS!", item);
            });

            SettingsService.updateByName('ANALYSER_SETTINGS', ctrl.analyserSettings).then(function (item) {
                console.log("Updated ANALYSER_SETTINGS!", item);
            })
        }

        function addNewAnalyserItem() {
            ctrl.analyserSettings.push({findRe: '', takeTitle: '', takeGroup: '', active: true});
        }

        function removeAnalyserItem(index) {
            ctrl.analyserSettings.splice(index, 1);
        }

        function testAnalyserItem(analyseSetting, index) {
            ctrl.analyserTestItems[index] = [];
            if (!todaysTrackItems) {
                alert('Track items not loaded, try again!');
                return;
            }

            _.each(todaysTrackItems, function (item) {

                var str = item.title;
                var re = new RegExp(analyseSetting.findRe, "g");
                var myArray = re.exec(str);

                if (myArray != null) {
                    console.log(myArray);
                    let first = myArray[0];
                    ctrl.analyserTestItems[index].push(item);
                }
            });
        }

    });
