'use strict';

function getSchedule(data) {
  let schedule = Array(24).fill([]);
  let devices = data.devices.sort(_comparareDevices);
  let rates = data.rates;
  let powers = Array(24).fill(data.maxPower);
  let prices = Array(24).fill(0);

  const defaultMode = {
    'day': {
      from: 7,
      to: 23
    },
    'night': {
      from: 23,
      to: 7
    }
  }

  // Заполняем почасовую цену

  for (let key in rates) {
    let from = rates[key].from;
    let to = rates[key].to;

    if ((to - from) > 0) {
      prices.fill(rates[key].value, from, to);
    }
    else {
      prices.fill(rates[key].value, from, 24);
      prices.fill(rates[key].value, 0, to);
    }
  }


  console.log(schedule);
  console.log(devices);
  console.log(prices);
  console.log(powers);

  // Распеределяем приборы

  for (let item in devices) {
    let id = devices[item].id;
    let duration = devices[item].duration;
    let mode = devices[item].mode;
    let power = devices[item].power;
    console.log(id);
    console.log(duration);
    console.log(mode);






    // powers[3] = 3;
    // console.log(powers);


    let commonCheck = function(hour) {
      // debugger
      let curModeFunc = checkMode.bind(null, mode);
      let curPowerFunc = _checkPower.bind(null, power);

      console.log(curModeFunc(hour));
      console.log(curPowerFunc(hour));

      return curModeFunc(hour)&& curPowerFunc(hour);
    }

    for (var i = 0; i < 24; i++) {

      console.log(i+'_______'+commonCheck(i));

    }






    // console.log(dayFunc(4));

    // checkMode(hour, mode)

    // console.log(Math.round(findMinSubArray(prices, duration)[1]*power/1000 * 10000)/10000);
    console.log('!!!!!!!!!!!!!!!!!'+Math.round(findMinSubArray(prices, duration, commonCheck)[1] * 10000)/10000);

    // console.log(checkMode(23, mode));
  }


  function findFirstSubArray(array, l, checkFunc) {
    let begin =0;
    let result = -1;
    let minimum = 0;

    while ((begin <= array.length - l) && (result < 0)) {
      result = checkLength(l);
    }

    return {
      beginIndex: ((begin + l - 1) < array.length?begin:-1),
      min: minimum
    }

    function checkLength(k) {
      if (k!==0) {
        if (checkFunc(begin + k)) {
          minimum += array[begin + k];
          return checkLength(k-1);
        }
        else {
          begin +=k;
          minimum = 0;
          return -1;
        }
      }
      else {
        begin++;
        return true;
      }
    }
  }

  // TEST

  // function test(a) {
  //   if ((a === 1) || (a === 5)){
  //     return false;
  //   }
  //
  //   return true;
  // }


  function findMinSubArray(nums, k, checkFunc) {
    let beginValue = findFirstSubArray(nums, k, checkFunc);
    let curr_min = beginValue.min;

    console.log(beginValue);

    var max_so_far = curr_min;
    var begin_index = beginValue.beginIndex;
    var falseCount = 0; // показывает сколько осталось до свободного значения


    for (var j = k + begin_index; j < nums.length + k - 1; j++) {


      let nextIndex = (j < nums.length)?j: j - nums.length;
      curr_min += (nums[nextIndex] - nums[j - k]);

      if (!(checkFunc(nextIndex))) {
        falseCount = k;
      }

      console.log(nextIndex + '_____');

      if (falseCount === 0) {
        console.log(curr_min);
        if (curr_min < max_so_far) {
          max_so_far = curr_min;
          begin_index = j - k + 1;
        }
      }
      else {
        console.log(curr_min + 'плохое');
        falseCount--;
      }
    }
    return [begin_index, max_so_far];
  }

  function checkMode(mode, hour) {
    switch (mode) {
      case 'day':
        if ((hour >= defaultMode[mode].from) && (hour < defaultMode[mode].to)) {
          return 1;
        }
        return 0;
      case 'night':
        if (((hour >= defaultMode[mode].from) && (hour < 24)) || (hour < defaultMode[mode].to)) {
          return 1;
        }
        return 0;
      default:
        return 1;
    }
  }

  function _checkPower(powerDevice, hour) {
    console.log('Разность силы: ' + (powers[hour] - powerDevice));
    return (((powers[hour] - powerDevice) > 0)?1:0)
  }

  function _comparareDevices(obj1, obj2) {
    return (obj2.duration - obj1.duration)||(_weightMode(obj2.mode) - _weightMode(obj1.mode))||(obj2.power - obj1.power);
  }

  function _weightMode(mode) {
      switch (mode) {
      case 'day':
        return 2;
      case 'night':
        return 1;
      default:
      return 0;
    }
  }
}
