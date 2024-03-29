'use strict';

function getSchedule(data) {
  let devices = data.devices.sort(_comparareDevices);
  let rates = data.rates;
  let powers = Array(24).fill(data.maxPower);
  let prices = Array(24).fill(0);
  let schedule = Array(24);
  let consumedEnergy = {
    value: 0,
    devices: {}
  }

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

  for (let i = 0; i < schedule.length; i++) {
    schedule[i]=[];
  }

  // Заполнение почасовой цены
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

  // Распеределение очередности распределения приборов
  for (let item in devices) {
    let id = devices[item].id;
    let duration = devices[item].duration;
    let mode = devices[item].mode;
    let power = devices[item].power;

    let commonCheck = function(hour) {
      let curModeFunc = checkMode.bind(null, mode);
      let curPowerFunc = _checkPower.bind(null, power);

      return curModeFunc(hour)&& curPowerFunc(hour);
    }

    let beginSchedule = findMinSubArray(prices, duration, commonCheck);

    addSchedule(beginSchedule[0], duration, id, power);
    addConsumedEnergy(id, Math.round(beginSchedule[1] * power/1000*10000)/10000);
  }

  return {schedule, consumedEnergy}

  // Добавление в расписание
  // beginIndex - индекс с которого начинается промежуток времени,
  // count - число элементов (длительность работы прибора),
  // id - идентификатор прибора;
  // power - мощность прибора
  function addSchedule(beginIndex, count, id, power) {
    for (let i = beginIndex; i < beginIndex + count; i++) {
      let curIndex = (i < schedule.length)?i:(i - schedule.length);
      schedule[curIndex].push(id);
      powers[curIndex] -= power;
    }
  }

  // Добавление данных о приборе в статистику
  // id - идентификатор
  // value - значение
  function addConsumedEnergy(id, value) {
    consumedEnergy.value +=value;
    consumedEnergy.devices[id] = value;
  }

  // Поиск первого подходящего промежутка (необходимо для алгоритма поиска подмассива)
  // array - массив, в котором ищем
  // l - длина искомого подмассива
  // checkFunc - функция с уловиями для проверки
  // RETURN object
  // beginIndex - индекс, с которого начинается искомый подмассив (-1, если такого нет)
  // min - минимальная стоимость на этом участке
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
        if (checkFunc(begin + k - 1)) {
          minimum += array[begin + k - 1];
          return checkLength(k-1);
        }
        else {
          begin +=k;
          minimum = 0;
          return -1;
        }
      }
      else {
        return true;
      }
    }
  }

  // Поиск подмассива с минимальной суммой, удовлетворяющий условиям
  // nums - массив
  // k - длина подмассива
  // checkFunc - функция проверки
  // RETURN array
  // begin_index - индекс, с которого начинается необходимый подмассив
  // max_so_far - минимальная стоимость на этом участке

  function findMinSubArray(nums, k, checkFunc) {
    let beginValue = findFirstSubArray(nums, k, checkFunc);
    let curr_min = beginValue.min;
    let max_so_far = curr_min;
    let begin_index = beginValue.beginIndex;
    let falseCount = 0; // показывает сколько осталось до подходящего значения

    for (let j = k + begin_index; j < nums.length + k - 1; j++) {
      let nextIndex = (j < nums.length)?j: j - nums.length;
      curr_min += (nums[nextIndex] - nums[j - k]);

      if (!(checkFunc(nextIndex))) {
        falseCount = k;
      }

      if (falseCount === 0) {
        if (curr_min < max_so_far) {
          max_so_far = curr_min;
          begin_index = j - k + 1;
        }
      }
      else {
        falseCount--;
      }
    }
    return [begin_index, max_so_far];
  }

  // Проверка mode (день/ночь)
  // mode - mode
  // hour - проверяемый час
  // RETURN true/false
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

  // Проверка мощности
  // powerDevice - мощность прибора
  // hour - проверяемый час
  // RETURN true/false
  function _checkPower(powerDevice, hour) {
    return (((powers[hour] - powerDevice) >= 0)?1:0)
  }

  // Функция сортировки приборов
  // obj{i} - iый прибор
  function _comparareDevices(obj1, obj2) {
    return (obj2.duration - obj1.duration)||(_weightMode(obj2.mode) - _weightMode(obj1.mode))||(obj2.power - obj1.power);
  }

  // Функция проверки mode (для сортировки приборов)
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
