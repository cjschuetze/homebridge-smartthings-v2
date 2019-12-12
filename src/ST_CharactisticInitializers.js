var Characteristic;

module.exports = class CharacteristicsClass {
    constructor(accessories, char) {
        this.platform = accessories;
        this.log = accessories.log;
        this.logConfig = accessories.logConfig;
        this.accessories = accessories;
        this.client = accessories.client;
        this.myUtils = accessories.myUtils;
        this.CommunityTypes = accessories.CommunityTypes;
        Characteristic = char;
        this.homebridge = accessories.homebridge;
    }

    alarm_system(accessory, service) {
        accessory.manageGetCharacteristic(service, Characteristic.SecuritySystemCurrentState, 'alarmSystemStatus');
        accessory.manageGetSetCharacteristic(service, Characteristic.SecuritySystemTargetState, 'alarmSystemStatus');

        accessory.context.deviceGroups.push("alarm_system");
        return accessory;
    }

    battery(accessory, service) {
        accessory.manageGetCharacteristic(service, Characteristic.BatteryLevel, 'battery');
        accessory.manageGetCharacteristic(service, Characteristic.StatusLowBattery, 'battery');
        accessory.manageGetCharacteristic(service, Characteristic.ChargingState, 'batteryStatus');
        accessory.context.deviceGroups.push("battery");
        return accessory;
    }

    button(accessory, service) {
        accessory.manageGetCharacteristic(service, Characteristic.ProgrammableSwitchEvent, 'button', {
            evtOnly: false,
            props: {
                validValues: this.accessories.transformAttributeState('supportedButtonValues', accessory.context.deviceData.attributes.supportedButtonValues)
            }
        });
        accessory.context.deviceGroups.push("button");
        return accessory;
    }

    carbon_dioxide(accessory, service) {
        accessory.manageGetCharacteristic(service, Characteristic.CarbonDioxideDetected, 'carbonDioxideMeasurement', { charName: 'Carbon Dioxide Detected' });
        accessory.manageGetCharacteristic(service, Characteristic.CarbonDioxideLevel, 'carbonDioxideMeasurement');
        accessory.manageGetCharacteristic(service, Characteristic.StatusActive, 'status');
        if (accessory.hasCapability('Tamper Alert'))
            accessory.manageGetCharacteristic(service, Characteristic.StatusTampered, 'tamper');
        accessory.context.deviceGroups.push("carbon_dioxide");
        return accessory;
    }

    carbon_monoxide(accessory, service) {
        accessory.manageGetCharacteristic(service, Characteristic.CarbonMonoxideDetected, 'carbonMonoxide', { charName: 'Carbon Monoxide Detected' });
        accessory.manageGetCharacteristic(service, Characteristic.StatusActive, 'status');
        if (accessory.hasCapability('Tamper Alert'))
            accessory.manageGetCharacteristic(service, Characteristic.StatusTampered, 'tamper');
        accessory.context.deviceGroups.push("carbon_monoxide");
        return accessory;
    }

    contact_sensor(accessory, service) {
        accessory.manageGetCharacteristic(service, Characteristic.ContactSensorState, 'contact');
        accessory.manageGetCharacteristic(service, Characteristic.StatusActive, 'status');
        if (accessory.hasCapability('Tamper Alert'))
            accessory.manageGetCharacteristic(service, Characteristic.StatusTampered, 'tamper');
        accessory.context.deviceGroups.push("contact_sensor");
        return accessory;
    }

    energy_meter(accessory, service) {
        accessory.manageGetCharacteristic(service, this.CommunityTypes.KilowattHours, 'energy');

        accessory.context.deviceGroups.push("energy_meter");
        return accessory;
    }

    fan(accessory, service) {
        accessory.manageGetSetCharacteristic(service, Characteristic.Active, 'switch');
        accessory.manageGetCharacteristic(service, Characteristic.CurrentFanState, 'switch', { get: { altAttr: "fanState" } });
        let spdSteps = 1;
        if (accessory.hasDeviceFlag('fan_3_spd')) spdSteps = 33;
        if (accessory.hasDeviceFlag('fan_4_spd')) spdSteps = 25;
        let spdAttr = (accessory.hasAttribute('level')) ? "level" : (accessory.hasAttribute('fanSpeed') && accessory.hasCommand('setFanSpeed')) ? 'fanSpeed' : undefined;
        accessory.manageGetSetCharacteristic(service, Characteristic.RotationSpeed, spdAttr, { cmdHasVal: true, props: { minSteps: spdSteps } });

        accessory.context.deviceGroups.push("fan");
        return accessory;
    }

    garage_door(accessory, service) {
        accessory.manageGetCharacteristic(service, Characteristic.CurrentDoorState, 'door', { charName: 'Current Door State' });
        accessory.manageGetSetCharacteristic(service, Characteristic.TargetDoorState, 'door', { charName: 'Target Door State' });

        if (!accessory.hasCharacteristic(service, Characteristic.ObstructionDetected)) {
            accessory.getOrAddService(service).setCharacteristic(Characteristic.ObstructionDetected, false);
        }

        return accessory;
    }

    humidity_sensor(accessory, service) {
        accessory.manageGetCharacteristic(service, Characteristic.CurrentRelativeHumidity, 'humidity');
        accessory.manageGetCharacteristic(service, Characteristic.StatusActive, 'status');
        if (accessory.hasCapability('Tamper Alert'))
            accessory.manageGetCharacteristic(service, Characteristic.StatusTampered, 'tamper');
        accessory.context.deviceGroups.push("humidity_sensor");
        return accessory;
    }

    illuminance_sensor(accessory, service) {
        accessory.manageGetCharacteristic(service, Characteristic.CurrentAmbientLightLevel, 'illuminance');
        accessory.manageGetCharacteristic(service, Characteristic.StatusActive, 'status');
        if (accessory.hasCapability('Tamper Alert'))
            accessory.manageGetCharacteristic(service, Characteristic.StatusTampered, 'tamper');
        accessory.context.deviceGroups.push("illuminance_sensor");
        return accessory;
    }

    light(accessory, service) {
        accessory.manageGetSetCharacteristic(service, Characteristic.On, 'switch');
        if (accessory.hasAttribute('level'))
            accessory.manageGetSetCharacteristic(service, Characteristic.Brightness, 'level', { cmdHasVal: true });
        if (accessory.hasAttribute('hue'))
            accessory.manageGetSetCharacteristic(service, Characteristic.Hue, 'hue', {
                cmdHasVal: true,
                props: {
                    minValue: 1,
                    maxValue: 30000
                }
            });

        if (accessory.hasAttribute('saturation'))
            accessory.manageGetSetCharacteristic(service, Characteristic.Saturation, 'saturation', { cmdHasVal: true });

        if (accessory.hasAttribute('colorTemperature'))
            accessory.manageGetSetCharacteristic(service, Characteristic.ColorTemperature, 'colorTemperature', { cmdHasVal: true });

        accessory.context.deviceGroups.push("light_bulb");
        return accessory;
    }

    lock(accessory, service) {
        accessory.manageGetCharacteristic(service, Characteristic.LockCurrentState, 'lock');
        accessory.manageGetSetCharacteristic(service, Characteristic.LockTargetState, 'lock');

        accessory.context.deviceGroups.push("lock");
        return accessory;
    }

    motion_sensor(accessory, service) {
        accessory.manageGetCharacteristic(service, Characteristic.MotionDetected, 'motion');
        accessory.manageGetCharacteristic(service, Characteristic.StatusActive, 'status');
        if (accessory.hasCapability('Tamper Alert'))
            accessory.manageGetCharacteristic(service, Characteristic.StatusTampered, 'tamper');

        accessory.context.deviceGroups.push("motion_sensor");
        return accessory;
    }

    power_meter(accessory, service) {
        accessory.manageGetCharacteristic(service, this.CommunityTypes.Watts, 'power');

        accessory.context.deviceGroups.push("power_meter");
        return accessory;
    }

    presence_sensor(accessory, service) {
        accessory.manageGetCharacteristic(service, Characteristic.OccupancyDetected, 'presence');
        accessory.manageGetCharacteristic(service, Characteristic.StatusActive, 'status');
        if (accessory.hasCapability('Tamper Alert'))
            accessory.manageGetCharacteristic(service, Characteristic.StatusTampered, 'tamper');

        accessory.context.deviceGroups.push("presence_sensor");
        return accessory;
    }

    smoke_detector(accessory, service) {
        accessory.manageGetCharacteristic(service, Characteristic.SmokeDetected, 'smoke');
        accessory.manageGetCharacteristic(service, Characteristic.StatusActive, 'status');
        if (accessory.hasCapability('Tamper Alert'))
            accessory.manageGetCharacteristic(service, Characteristic.StatusTampered, 'tamper');

        accessory.context.deviceGroups.push("smoke_detector");
        return accessory;
    }

    speaker(accessory, service) {
        let isSonos = (accessory.context.deviceData.manufacturerName === "Sonos");
        let lvlAttr = (isSonos || accessory.hasAttribute('volume')) ? 'volume' : accessory.hasAttribute('level') ? 'level' : undefined;
        if (!this.hasCharacteristic(service, Characteristic.Volume)) {
            let sonosVolumeTimeout = null;
            let lastVolumeWriteValue = null;
            let c = accessory
                .getOrAddService(service)
                .getCharacteristic(Characteristic.Volume)
                .on("get", (callback) => {
                    callback(null, this.accessories.transformAttributeState(lvlAttr, accessory.context.deviceData.attributes[lvlAttr]) || 0);
                })
                .on("set", (value, callback) => {
                    if (isSonos) {
                        if (value > 0 && value !== lastVolumeWriteValue) {
                            lastVolumeWriteValue = value;
                            sonosVolumeTimeout = this.accessories.clearAndSetTimeout(sonosVolumeTimeout, () => {
                                this.log.debug(`Existing volume: ${accessory.context.deviceData.attributes.volume}, set to ${lastVolumeWriteValue}`);
                                this.client.sendDeviceCommand(callback, accessory.context.deviceData.deviceid, "setVolume", {
                                    value1: lastVolumeWriteValue
                                });
                            }, 1000);
                        }
                    }
                    else if (value > 0) {
                        this.client.sendDeviceCommand(callback, accessory.context.deviceData.deviceid, this.accessories.transformCommandName(lvlAttr, value), {
                            value1: this.accessories.transformAttributeState(lvlAttr, value)
                        });
                    }
                });
            this.accessories.storeCharacteristicItem("volume", accessory.context.deviceData.deviceid, c);
        } else {
            this.getOrAddService(service).getCharacteristic(Characteristic.Volume).updateValue(this.accessories.transformAttributeState(lvlAttr, accessory.context.deviceData.attributes[lvlAttr]) || 0);
        }

        accessory.manageGetSetCharacteristic(service, Characteristic.Mute, 'mute');

        accessory.context.deviceGroups.push("speaker_device");
        return accessory;
    }

    switch_device(accessory, service) {
        accessory.manageGetSetCharacteristic(service, Characteristic.On, 'switch');

        accessory.context.deviceGroups.push("switch");
        return accessory;
    }

    temperature_sensor(accessory, service) {
        accessory.manageGetCharacteristic(service, Characteristic.CurrentTemperature, 'temperature', {
            props: {
                minValue: this.myUtils.tempConversion(40),
                maxValue: this.myUtils.tempConversion(90),
            }
        });
        if (accessory.hasCapability('Tamper Alert'))
            accessory.manageGetCharacteristic(service, Characteristic.StatusTampered, 'tamper');
        accessory.context.deviceGroups.push("temperature_sensor");
        return accessory;
    }

    thermostat(accessory, service) {
        //TODO:  Still seeing an issue when setting mode from OFF to HEAT.  It's setting the temp to 40 but if I change to cool then back to heat it sets the correct value.
        let validModes = [];
        if (typeof accessory.context.deviceData.attributes.supportedThermostatModes === "string") {
            if (accessory.context.deviceData.attributes.supportedThermostatModes.includes("off")) {
                validModes.push(Characteristic.TargetHeatingCoolingState.OFF);
            }
            if (accessory.context.deviceData.attributes.supportedThermostatModes.includes("heat") || accessory.context.deviceData.attributes.supportedThermostatModes.includes("emergency heat")) {
                validModes.push(Characteristic.TargetHeatingCoolingState.HEAT);
            }
            if (accessory.context.deviceData.attributes.supportedThermostatModes.includes("cool")) {
                validModes.push(Characteristic.TargetHeatingCoolingState.COOL);
            }
            if (accessory.context.deviceData.attributes.supportedThermostatModes.includes("auto")) {
                validModes.push(Characteristic.TargetHeatingCoolingState.AUTO);
            }
        }
        let thisChar;
        thisChar = accessory
            .getOrAddService(service)
            .getCharacteristic(Characteristic.CurrentHeatingCoolingState)
            .on("get", (callback) => {
                callback(null, this.accessories.transformAttributeState('thermostatOperatingState', accessory.context.deviceData.attributes.thermostatOperatingState));
            });
        this.accessories.storeCharacteristicItem("thermostatOperatingState", accessory.context.deviceData.deviceid, thisChar);

        // Handle the Target State
        thisChar = accessory
            .getOrAddService(service)
            .getCharacteristic(Characteristic.TargetHeatingCoolingState)
            .setProps({
                validValues: validModes
            })
            .on("get", (callback) => {
                callback(null, this.accessories.transformAttributeState('thermostatMode', accessory.context.deviceData.attributes.thermostatMode));
            })
            .on("set", (value, callback) => {
                let state;
                switch (value) {
                    case Characteristic.TargetHeatingCoolingState.COOL:
                        state = "cool";
                        break;
                    case Characteristic.TargetHeatingCoolingState.HEAT:
                        state = "heat";
                        break;
                    case Characteristic.TargetHeatingCoolingState.AUTO:
                        state = "auto";
                        break;
                    case Characteristic.TargetHeatingCoolingState.OFF:
                        state = "off";
                        break;
                }
                this.client.sendDeviceCommand(callback, accessory.context.deviceData.deviceid, "setThermostatMode", {
                    value1: state
                });
                accessory.context.deviceData.attributes.thermostatMode = state;
            });

        this.accessories.storeCharacteristicItem("thermostatMode", accessory.context.deviceData.deviceid, thisChar);

        if (accessory.hasCapability('Relative Humidity Measurement')) {
            thisChar = accessory
                .getOrAddService(service)
                .getCharacteristic(Characteristic.CurrentRelativeHumidity)
                .on("get", (callback) => {
                    callback(null, parseInt(accessory.context.deviceData.attributes.humidity));
                });
            this.accessories.storeCharacteristicItem("humidity", accessory.context.deviceData.deviceid, thisChar);
        }
        thisChar = accessory
            .getOrAddService(service)
            .getCharacteristic(Characteristic.CurrentTemperature)
            .setProps({
                minValue: this.myUtils.thermostatTempConversion(40),
                maxValue: this.myUtils.thermostatTempConversion(90),
                minSteps: (this.platform.getTempUnit() === 'F') ? 1.0 : 0.5
            })
            .on("get", (callback) => {
                callback(null, this.myUtils.thermostatTempConversion(accessory.context.deviceData.attributes.temperature));
            });
        this.accessories.storeCharacteristicItem("temperature", accessory.context.deviceData.deviceid, thisChar);

        thisChar = accessory
            .getOrAddService(service)
            .getCharacteristic(Characteristic.TargetTemperature)
            .setProps({
                minValue: this.myUtils.thermostatTempConversion(40),
                maxValue: this.myUtils.thermostatTempConversion(90),
                minSteps: (this.platform.getTempUnit() === 'F') ? 1.0 : 0.5
            })
            .on("get", (callback) => {
                let temp;
                switch (accessory.context.deviceData.attributes.thermostatMode) {
                    case 'cool':
                    case 'cooling':
                        temp = accessory.context.deviceData.attributes.coolingSetpoint;
                        break;
                    case 'emergency heat':
                    case 'heat':
                    case 'heating':
                        temp = accessory.context.deviceData.attributes.heatingSetpoint;
                        break;
                    default:
                        switch (accessory.context.deviceData.attributes.thermostatOperatingState) {
                            case 'cooling':
                            case 'cool':
                                temp = accessory.context.deviceData.attributes.coolingSetpoint;
                                break;
                            default:
                                temp = accessory.context.deviceData.attributes.heatingSetpoint;
                                break;
                        }
                        break;
                }
                callback(null, temp ? this.myUtils.thermostatTempConversion(temp) : "Unknown");
            })
            .on("set", (value, callback) => {
                // Convert the Celsius value to the appropriate unit for Smartthings
                let temp = this.myUtils.thermostatTempConversion(value, true);
                switch (accessory.context.deviceData.attributes.thermostatMode) {
                    case "cool":
                        this.client.sendDeviceCommand(callback, accessory.context.deviceData.deviceid, "setCoolingSetpoint", {
                            value1: temp
                        });
                        accessory.context.deviceData.attributes.coolingSetpoint = temp;
                        accessory.context.deviceData.attributes.thermostatSetpoint = temp;
                        break;
                    case "emergency heat":
                    case "heat":
                        this.client.sendDeviceCommand(callback, accessory.context.deviceData.deviceid, "setHeatingSetpoint", {
                            value1: temp
                        });
                        accessory.context.deviceData.attributes.heatingSetpoint = temp;
                        accessory.context.deviceData.attributes.thermostatSetpoint = temp;
                        break;
                    default:
                        this.client.sendDeviceCommand(callback, accessory.context.deviceData.deviceid, "setThermostatSetpoint", {
                            value1: temp
                        });
                        accessory.context.deviceData.attributes.thermostatSetpoint = temp;
                }
            });
        this.accessories.storeCharacteristicItem("thermostatMode", accessory.context.deviceData.deviceid, thisChar);
        this.accessories.storeCharacteristicItem("coolingSetpoint", accessory.context.deviceData.deviceid, thisChar);
        this.accessories.storeCharacteristicItem("heatingSetpoint", accessory.context.deviceData.deviceid, thisChar);
        this.accessories.storeCharacteristicItem("thermostatSetpoint", accessory.context.deviceData.deviceid, thisChar);
        this.accessories.storeCharacteristicItem("temperature", accessory.context.deviceData.deviceid, thisChar);

        thisChar = accessory
            .getOrAddService(service)
            .getCharacteristic(Characteristic.TemperatureDisplayUnits)
            .on("get", (callback) => {
                callback(null, (this.platform.getTempUnit() === 'F') ? Characteristic.TemperatureDisplayUnits.FAHRENHEIT : Characteristic.TemperatureDisplayUnits.CELSIUS);
            });
        this.accessories.storeCharacteristicItem("temperature_unit", "platform", thisChar);

        thisChar = accessory
            .getOrAddService(service)
            .getCharacteristic(Characteristic.HeatingThresholdTemperature)
            .setProps({
                minValue: this.myUtils.thermostatTempConversion(40),
                maxValue: this.myUtils.thermostatTempConversion(90),
                minSteps: (this.platform.getTempUnit() === 'F') ? 1.0 : 0.5
            })
            .on("get", (callback) => {
                callback(null, this.myUtils.thermostatTempConversion(accessory.context.deviceData.attributes.heatingSetpoint));
            })
            .on("set", (value, callback) => {
                // Convert the Celsius value to the appropriate unit for Smartthings
                let temp = this.myUtils.thermostatTempConversion(value, true);
                this.client.sendDeviceCommand(callback, accessory.context.deviceData.deviceid, "setHeatingSetpoint", {
                    value1: temp
                });
                accessory.context.deviceData.attributes.heatingSetpoint = temp;
            });
        this.accessories.storeCharacteristicItem("heatingSetpoint", accessory.context.deviceData.deviceid, thisChar);

        thisChar = accessory
            .getOrAddService(service)
            .getCharacteristic(Characteristic.CoolingThresholdTemperature)
            .setProps({
                minValue: this.myUtils.thermostatTempConversion(40),
                maxValue: this.myUtils.thermostatTempConversion(90),
                minSteps: (this.platform.getTempUnit() === 'F') ? 1.0 : 0.5
            })
            .on("get", (callback) => {
                callback(null, this.myUtils.thermostatTempConversion(accessory.context.deviceData.attributes.coolingSetpoint));
            })
            .on("set", (value, callback) => {
                // Convert the Celsius value to the appropriate unit for Smartthings
                let temp = this.myUtils.thermostatTempConversion(value, true);
                this.client.sendDeviceCommand(callback, accessory.context.deviceData.deviceid, "setCoolingSetpoint", {
                    value1: temp
                });
                accessory.context.deviceData.attributes.coolingSetpoint = temp;
            });
        this.accessories.storeCharacteristicItem("coolingSetpoint", accessory.context.deviceData.deviceid, thisChar);

        accessory.context.deviceGroups.push("thermostat");
        return accessory;
    }

    valve(accessory, service) {
        accessory.manageGetCharacteristic(service, Characteristic.InUse, 'valve');
        accessory.manageGetSetCharacteristic(service, Characteristic.Active, 'valve');
        if (!this.hasCharacteristic(service, Characteristic.ValveType))
            accessory.getOrAddService(service).setCharacteristic(Characteristic.ValveType, 0);

        accessory.context.deviceGroups.push("valve");
        return accessory;
    }

    virtual_mode(accessory, service) {
        if (!this.hasCharacteristic(service, Characteristic.On)) {
            let c = accessory
                .getOrAddService(service)
                .getCharacteristic(Characteristic.On)
                .on("get", (callback) => {
                    callback(null, this.accessories.transformAttributeState('switch', accessory.context.deviceData.attributes.switch));
                })
                .on("set", (value, callback) => {
                    if (value && (accessory.context.deviceData.attributes.switch === "off")) {
                        this.client.sendDeviceCommand(callback, accessory.context.deviceData.deviceid, "mode");
                    }
                });
            this.accessories.storeCharacteristicItem("switch", accessory.context.deviceData.deviceid, c);
        } else {
            this.getOrAddService(service).getCharacteristic(Characteristic.On).updateValue(this.accessories.transformAttributeState('switch', this.context.deviceData.attributes.switch));
        }

        accessory.context.deviceGroups.push("virtual_mode");
        return accessory;
    }

    virtual_routine(accessory, service) {
        if (!this.hasCharacteristic(service, Characteristic.On)) {
            let c = accessory
                .getOrAddService(service)
                .getCharacteristic(Characteristic.On)
                .on("get", (callback) => {
                    callback(null, this.accessories.transformAttributeState('switch', accessory.context.deviceData.attributes.switch));
                })
                .on("set", (value, callback) => {
                    if (value) {
                        this.client.sendDeviceCommand(callback, accessory.context.deviceData.deviceid, "routine");
                        setTimeout(() => {
                            console.log("routineOff...");
                            accessory.context.deviceData.attributes.switch = "off";
                            accessory
                                .getOrAddService(service)
                                .getCharacteristic(Characteristic.On)
                                .updateValue(false);
                        }, 2000);
                    }
                });
            this.accessories.storeCharacteristicItem("switch", accessory.context.deviceData.deviceid, c);
        } else {
            this.getOrAddService(service).getCharacteristic(Characteristic.On).updateValue(this.accessories.transformAttributeState('switch', this.context.deviceData.attributes.switch));
        }
        accessory.context.deviceGroups.push("virtual_routine");
        return accessory;
    }

    water_sensor(accessory, service) {
        accessory.manageGetCharacteristic(service, Characteristic.LeakDetected, 'water');
        accessory.manageGetCharacteristic(service, Characteristic.StatusActive, 'status');
        if (accessory.hasCapability('Tamper Alert'))
            accessory.manageGetCharacteristic(service, Characteristic.StatusTampered, 'tamper');
        accessory.deviceGroups.push("window_shade");
        return accessory;
    }

    window_shade(accessory, service) {
        accessory.manageGetCharacteristic(service, Characteristic.CurrentPosition, 'level');

        if (!this.hasCharacteristic(service, Characteristic.TargetPosition)) {
            let thisChar;
            thisChar = accessory
                .getOrAddService(service)
                .getCharacteristic(Characteristic.TargetPosition)
                .on("get", (callback) => {
                    callback(null, parseInt(accessory.context.deviceData.attributes.level));
                })
                .on("set", (value, callback) => {
                    if (accessory.hasCommand('close') && value === 0) {
                        // setLevel: 0, not responding on spring fashion blinds
                        this.client.sendDeviceCommand(callback, accessory.context.deviceData.deviceid, "close");
                    } else {
                        this.client.sendDeviceCommand(callback, accessory.context.deviceData.deviceid, "setLevel", {
                            value1: value
                        });
                    }
                });
            this.accessories.storeCharacteristicItem("level", accessory.context.deviceData.deviceid, thisChar);
        } else {
            this.getOrAddService(service).getCharacteristic(Characteristic.TargetPosition).updateValue(this.accessories.transformAttributeState('level', this.context.deviceData.attributes.level, 'Target Position'));
        }
        accessory.getOrAddService(service).setCharacteristic(Characteristic.PositionState, Characteristic.PositionState.STOPPED);

        accessory.deviceGroups.push("window_shade");
        return accessory;
    }
};