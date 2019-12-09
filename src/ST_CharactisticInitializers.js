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

    createGetCharacteristic(svc, char, attr, props = undefined, evtOnly = undefined) {
        if (!this.hasCharacteristic(svc, char)) {
            let c = this
                .getOrAddService(svc)
                .getCharacteristic(char)
                .on("get", (callback) => {
                    callback(null, this.transformAttributeState(attr, this.context.deviceData.attributes[attr]));
                });
            if (props && Object.keys(props).length) c.setProps(props);
            if (evtOnly) c.eventOnlyCharacteristic = evtOnly;
            this.storeCharacteristicItem(attr, this.context.deviceData.deviceid, c);
        }
    }

    createGetSetCharacteristic(svc, char, attr, props = undefined, evtOnly = undefined) {
        if (!this.hasCharacteristic(svc, char)) {
            let c = this
                .getOrAddService(svc)
                .getCharacteristic(char)
                .on("get", (callback) => {
                    callback(null, this.accessories.transformAttributeState(attr, this.context.deviceData.attributes[attr]));
                })
                .on("set", (value, callback) => {
                    this.client.sendDeviceCommand(callback, this.context.deviceData.deviceid, this.transformCommandValue(attr, value));
                });
            if (props && Object.keys(props).length) c.setProps(props);
            if (evtOnly) c.eventOnlyCharacteristic = evtOnly;
            this.storeCharacteristicItem(attr, this.context.deviceData.deviceid, c);
        }
    }

    // eslint-disable-next-line no-unused-vars
    initializeCharacteristic(svc, char) {

    }

    // eslint-disable-next-line no-unused-vars
    updateCharacteristic(svc, char) {

    }

    // eslint-disable-next-line no-unused-vars
    removeCharacteristic(svc, char) {

    }


    alarm_system(accessory, service) {
        let thisChar = accessory.getOrAddService(service);

        if (!accessory.hasCharacteristic(service, Characteristic.SecuritySystemCurrentState)) {
            thisChar = accessory
                .getOrAddService(service)
                .getCharacteristic(Characteristic.SecuritySystemCurrentState)
                .on("get", (callback) => {
                    callback(null, this.accessories.attributeStateTransform('alarmSystemStatus', accessory.context.deviceData.attributes.alarmSystemStatus));
                });
            this.accessories.storeCharacteristicItem("alarmSystemStatus", accessory.context.deviceData.deviceid, thisChar);
        } else {
            accessory.updateCharacteristicVal(service, Characteristic.SecuritySystemCurrentState, this.accessories.attributeStateTransform('alarmSystemStatus', accessory.context.deviceData.attributes.alarmSystemStatus));
        }

        if (!accessory.hasCharacteristic(service, Characteristic.SecuritySystemTargetState)) {
            thisChar = accessory
                .getOrAddService(service)
                .getCharacteristic(Characteristic.SecuritySystemTargetState)
                .on("get", (callback) => {
                    callback(null, this.accessories.attributeStateTransform('alarmSystemStatus', accessory.context.deviceData.attributes.alarmSystemStatus.toLowerCase()));
                })
                .on("set", (value, callback) => {
                    this.client.sendDeviceCommand(callback, accessory.context.deviceData.deviceid, this.myUtils.convertAlarmState(value, false, Characteristic));
                    accessory.updateDeviceAttr('alarmSystemStatus', this.myUtils.convertAlarmState(value, false, Characteristic));
                });
            this.accessories.storeCharacteristicItem("alarmSystemStatus", accessory.context.deviceData.deviceid, thisChar);
        } else {
            accessory.updateCharacteristicVal(service, Characteristic.SecuritySystemTargetState, this.accessories.attributeStateTransform('alarmSystemStatus', accessory.context.deviceData.attributes.alarmSystemStatus.toLowerCase()));
        }

        accessory.context.deviceGroups.push("alarm_system");
        return accessory;
    }


    battery(accessory, service) {
        let thisChar;
        // Updates Battery Level
        if (!accessory.hasCharacteristic(service, Characteristic.BatteryLevel)) {
            thisChar = accessory
                .getOrAddService(service)
                .getCharacteristic(Characteristic.BatteryLevel)
                .on("get", (callback) => {
                    callback(null, this.accessories.attributeStateTransform('battery', accessory.context.deviceData.attributes.battery, 'Battery Level'));
                });
            this.accessories.storeCharacteristicItem("battery", accessory.context.deviceData.deviceid, thisChar);
        } else {
            accessory.updateCharacteristicVal(service, Characteristic.BatteryLevel, this.accessories.attributeStateTransform('battery', accessory.context.deviceData.attributes.battery, 'Battery Level'));
        }

        // Updates Battery Low Status
        if (!accessory.hasCharacteristic(service, Characteristic.StatusLowBattery)) {
            thisChar = accessory
                .getOrAddService(service)
                .getCharacteristic(Characteristic.StatusLowBattery)
                .on("get", (callback) => {
                    callback(null, this.accessories.attributeStateTransform('battery', accessory.context.deviceData.attributes.battery, 'Status Low Battery'));
                });
            this.accessories.storeCharacteristicItem("battery", accessory.context.deviceData.deviceid, thisChar);
        } else {
            accessory.updateCharacteristicVal(service, Characteristic.StatusLowBattery, this.accessories.attributeStateTransform('battery', accessory.context.deviceData.attributes.battery, 'Status Low Battery'));
        }

        // Updates Battery CHARGING STATE
        if (!accessory.hasCharacteristic(service, Characteristic.ChargingState)) {
            thisChar = accessory
                .getOrAddService(service)
                .getCharacteristic(Characteristic.ChargingState)
                .on("get", (callback) => {
                    callback(null, this.accessories.attributeStateTransform('batteryStatus', accessory.context.deviceData.attributes.battery, 'Charging State'));
                });
            this.accessories.storeCharacteristicItem("battery", accessory.context.deviceData.deviceid, thisChar);
        } else {
            accessory.updateCharacteristicVal(service, Characteristic.ChargingState, this.accessories.attributeStateTransform('batteryStatus', accessory.context.deviceData.attributes.battery, 'Charging State'));
        }

        accessory.context.deviceGroups.push("battery");
        return accessory;
    }


    button(accessory, service) {
        let thisChar;

        if (!accessory.hasCharacteristic(service, Characteristic.ProgrammableSwitchEvent)) {
            let validValues = [];
            if (typeof accessory.context.deviceData.attributes.supportedButtonValues === "string") {
                for (const value of JSON.parse(accessory.context.deviceData.attributes.supportedButtonValues)) {
                    switch (value) {
                        case "pushed":
                            validValues.push(Characteristic.ProgrammableSwitchEvent.SINGLE_PRESS);
                            continue;
                        case "held":
                            validValues.push(Characteristic.ProgrammableSwitchEvent.LONG_PRESS);
                            continue;
                        case "double":
                            validValues.push(Characteristic.ProgrammableSwitchEvent.DOUBLE_PRESS);
                            continue;
                        default:
                            this.log.info("Button: (" + accessory.name + ") unsupported button value: " + value);
                    }
                }
            }

            thisChar = accessory
                .getOrAddService(service)
                .getCharacteristic(Characteristic.ProgrammableSwitchEvent)
                .setProps({
                    validValues
                })
                .on("get", (callback) => {
                    // Reset value to force `change` to fire for repeated presses
                    this.value = -1;
                    callback(null, this.accessories.attributeStateTransform('button', accessory.context.deviceData.attributes.button));
                });
            // Turned on by default for Characteristic.ProgrammableSwitchEvent, required to emit `change`
            thisChar.eventOnlyCharacteristic = false;
            this.accessories.storeCharacteristicItem("button", accessory.context.deviceData.deviceid, thisChar);
        }

        return accessory;
    }

    carbon_dioxide(accessory, service) {
        let thisChar;
        if (!accessory.hasCharacteristic(service, Characteristic.CarbonDioxideDetected)) {
            thisChar = accessory
                .getOrAddService(service)
                .getCharacteristic(Characteristic.CarbonDioxideDetected)
                .on("get", (callback) => {
                    callback(null, this.accessories.attributeStateTransform('carbonDioxideMeasurement', accessory.context.deviceData.attributes.carbonDioxideMeasurement, 'Carbon Dioxide Detected'));
                });
            this.accessories.storeCharacteristicItem("carbonDioxideMeasurement", accessory.context.deviceData.deviceid, thisChar);
        }
        if (!accessory.hasCharacteristic(service, Characteristic.CarbonDioxideLevel)) {
            thisChar = accessory
                .getOrAddService(service)
                .getCharacteristic(Characteristic.CarbonDioxideLevel)
                .on("get", (callback) => {
                    if (accessory.context.deviceData.attributes.carbonDioxideMeasurement >= 0) {
                        callback(null, accessory.context.deviceData.attributes.carbonDioxideMeasurement);
                    }
                });
            this.accessories.storeCharacteristicItem("carbonDioxideMeasurement", accessory.context.deviceData.deviceid, thisChar);
        }

        if (accessory.hasCapability('Tamper Alert')) {
            if (!accessory.hasCharacteristic(service, Characteristic.StatusTampered)) {
                thisChar = accessory
                    .getOrAddService(service)
                    .getCharacteristic(Characteristic.StatusTampered)
                    .on("get", (callback) => {
                        callback(null, this.accessories.attributeStateTransform('tamper', accessory.context.deviceData.attributes.tamper));
                    });
                this.accessories.storeCharacteristicItem("tamper", accessory.context.deviceData.deviceid, thisChar);
            }
        } else if (accessory.hasCharacteristic(service, Characteristic.StatusTampered)) {
            accessory.getOrAddService(service).removeCharacteristic(Characteristic.StatusTampered);
        }

        accessory.context.deviceGroups.push("carbon_dioxide");
        return accessory;
    }

    carbon_monoxide(accessory, service) {
        let thisChar;
        if (!accessory.hasCharacteristic(service, Characteristic.CarbonMonoxideDetected)) {
            thisChar = accessory
                .getOrAddService(service)
                .getCharacteristic(Characteristic.CarbonMonoxideDetected)
                .on("get", (callback) => {
                    callback(null, this.accessories.attributeStateTransform('carbonMonoxide', accessory.context.deviceData.attributes.carbonMonoxide));
                });
            this.accessories.storeCharacteristicItem("carbonMonoxide", accessory.context.deviceData.deviceid, thisChar);
        }

        if (accessory.hasCapability('Tamper Alert') && !accessory.hasCharacteristic(service, Characteristic.StatusTampered)) {
            thisChar = accessory
                .getOrAddService(service)
                .getCharacteristic(Characteristic.StatusTampered)
                .on("get", (callback) => {
                    callback(null, this.accessories.attributeStateTransform('tamper', accessory.context.deviceData.attributes.tamper));
                });
            this.accessories.storeCharacteristicItem("tamper", accessory.context.deviceData.deviceid, thisChar);
        }

        accessory.context.deviceGroups.push("carbon_monoxide");
        return accessory;
    }

    contact_sensor(accessory, service) {
        let thisChar;
        if (!accessory.hasCharacteristic(service, Characteristic.ContactSensorState)) {
            thisChar = accessory
                .getOrAddService(service)
                .getCharacteristic(Characteristic.ContactSensorState)
                .on("get", (callback) => {
                    callback(null, this.accessories.attributeStateTransform('contact', accessory.context.deviceData.attributes.contact));
                });
            this.accessories.storeCharacteristicItem("contact", accessory.context.deviceData.deviceid, thisChar);
        }
        if (accessory.hasCapability('Tamper Alert') && !accessory.hasCharacteristic(service, Characteristic.StatusTampered)) {
            thisChar = accessory
                .getOrAddService(service)
                .getCharacteristic(Characteristic.StatusTampered)
                .on("get", (callback) => {
                    callback(null, this.accessories.attributeStateTransform('tamper', accessory.context.deviceData.attributes.tamper));
                });
            this.accessories.storeCharacteristicItem("tamper", accessory.context.deviceData.deviceid, thisChar);
        }

        accessory.context.deviceGroups.push("contact_sensor");
        return accessory;
    }

    energy_meter(accessory, service) {
        let thisChar;
        if (!accessory.hasCharacteristic(service, Characteristic.KilowattHours)) {
            thisChar = accessory
                .getOrAddService(service)
                .addCharacteristic(this.CommunityTypes.KilowattHours)
                .on("get", (callback) => {
                    callback(null, this.accessories.attributeStateTransform('energy', accessory.context.deviceData.attributes.energy));
                });
            this.accessories.storeCharacteristicItem("energy", accessory.context.deviceData.deviceid, thisChar);
        }

        accessory.context.deviceGroups.push("energy_meter");
        return accessory;
    }

    fan(accessory, service) {
        let thisChar;
        if (!accessory.hasCharacteristic(service, Characteristic.Active)) {
            thisChar = accessory
                .getOrAddService(service)
                .getCharacteristic(Characteristic.Active)
                .on("get", (callback) => {
                    callback(null, this.accessories.attributeStateTransform('switch', accessory.context.deviceData.attributes.switch));
                })
                .on("set", (value, callback) => {
                    this.client.sendDeviceCommand(callback, accessory.context.deviceData.deviceid, (value ? "on" : "off"));
                });
            this.accessories.storeCharacteristicItem("switch", accessory.context.deviceData.deviceid, thisChar);
        }

        if (!accessory.hasCharacteristic(service, Characteristic.CurrentFanState)) {
            thisChar = accessory
                .getOrAddService(service)
                .getCharacteristic(Characteristic.CurrentFanState)
                .on("get", (callback) => {
                    let curState = (accessory.context.deviceData.attributes.switch === "off") ? Characteristic.CurrentFanState.IDLE : Characteristic.CurrentFanState.BLOWING_AIR;
                    callback(null, curState);
                });
            this.accessories.storeCharacteristicItem("switch", accessory.context.deviceData.deviceid, thisChar);
        }
        if (!accessory.hasCharacteristic(service, Characteristic.RotationSpeed)) {
            let spdSteps = 1;
            if (accessory.hasDeviceFlag('fan_3_spd')) spdSteps = 33;
            if (accessory.hasDeviceFlag('fan_4_spd')) spdSteps = 25;

            thisChar = accessory
                .getOrAddService(service)
                .getCharacteristic(Characteristic.RotationSpeed)
                .setProps({
                    minSteps: spdSteps
                })
                .on("get", (callback) => {
                    if (accessory.hasAttribute('level')) {
                        callback(null, this.accessories.attributeStateTransform("level", accessory.context.deviceData.attributes.level));
                    } else if (accessory.hasAttribute('fanSpeed') && accessory.hasCommand('setFanSpeed')) {
                        switch (parseInt(accessory.context.deviceData.attributes.fanSpeed)) {
                            case 0:
                                callback(null, 0);
                                break;
                            case 1:
                                callback(null, 33);
                                break;
                            case 2:
                                callback(null, 66);
                                break;
                            case 3:
                                callback(null, 100);
                                break;
                        }
                    }
                })
                .on("set", (value, callback) => {
                    if (value >= 0 && value <= 100) {
                        if (accessory.hasAttribute('level')) {
                            this.client.sendDeviceCommand(callback, accessory.context.deviceData.deviceid, "setLevel", {
                                value1: parseInt(value)
                            });
                            accessory.context.deviceData.attributes.level = value;
                        } else if (accessory.hasAttribute('fanSpeed') && accessory.hasCommand('setFanSpeed')) {
                            let spd;
                            if (value === 0) {
                                spd = 0;
                            } else if (value < 34) {
                                spd = 1;
                            } else if (value < 67) {
                                spd = 2;
                            } else {
                                spd = 3;
                            }
                            this.client.sendDeviceCommand(callback, accessory.context.deviceData.deviceid, "setFanSpeed", {
                                value1: spd
                            });
                            accessory.context.deviceData.attributes.fanSpeed = spd;
                        }
                    }
                });
            this.accessories.storeCharacteristicItem("level", accessory.context.deviceData.deviceid, thisChar);
        }

        accessory.context.deviceGroups.push("fan");
        return accessory;
    }

    garage_door(accessory, service) {
        let thisChar;

        if (!accessory.hasCharacteristic(service, Characteristic.TargetDoorState)) {
            thisChar = accessory
                .getOrAddService(service)
                .getCharacteristic(Characteristic.TargetDoorState)
                .on("get", (callback) => {
                    callback(null, this.accessories.attributeStateTransform('door', accessory.context.deviceData.attributes.door, 'Target Door State'));
                })
                .on("set", (value, callback) => {
                    if (value === Characteristic.TargetDoorState.OPEN || value === 0) {
                        this.client.sendDeviceCommand(callback, accessory.context.deviceData.deviceid, "open");
                        accessory.context.deviceData.attributes.door = "opening";
                    } else if (value === Characteristic.TargetDoorState.CLOSED || value === 1) {
                        this.client.sendDeviceCommand(callback, accessory.context.deviceData.deviceid, "close");
                        accessory.context.deviceData.attributes.door = "closing";
                    }
                });
            this.accessories.storeCharacteristicItem("door", accessory.context.deviceData.deviceid, thisChar);
        }

        if (!accessory.hasCharacteristic(service, Characteristic.CurrentDoorState)) {
            thisChar = accessory
                .getOrAddService(service)
                .getCharacteristic(Characteristic.CurrentDoorState)
                .on("get", (callback) => {
                    callback(null, this.accessories.attributeStateTransform('door', accessory.context.deviceData.attributes.door, 'Current Door State'));
                })
                .on("change", (obj) => {
                    this.log_change('door', 'CurrentDoorState', accessory, obj);
                });
            this.accessories.storeCharacteristicItem("door", accessory.context.deviceData.deviceid, thisChar);
        }

        if (!accessory.hasCharacteristic(service, Characteristic.ObstructionDetected)) {
            accessory
                .getOrAddService(service)
                .setCharacteristic(Characteristic.ObstructionDetected, false);
        }

        return accessory;
    }

    humidity_sensor(accessory, service) {
        let thisChar;
        thisChar = accessory
            .getOrAddService(service)
            .getCharacteristic(Characteristic.CurrentRelativeHumidity)
            .on("get", (callback) => {
                callback(null, this.accessories.attributeStateTransform('humidity', accessory.context.deviceData.attributes.humidity));
            });
        this.accessories.storeCharacteristicItem("humidity", accessory.context.deviceData.deviceid, thisChar);
        if (accessory.hasCapability('Tamper Alert') && !accessory.hasCharacteristic(service, Characteristic.StatusTampered)) {
            thisChar = accessory
                .getOrAddService(service)
                .getCharacteristic(Characteristic.StatusTampered)
                .on("get", (callback) => {
                    callback(null, this.accessories.attributeStateTransform('tamper', accessory.context.deviceData.attributes.tamper));
                })
                .on("change", (obj) => {
                    this.log_change('tamper', 'StatusTampered', accessory, obj);
                });
            this.accessories.storeCharacteristicItem("tamper", accessory.context.deviceData.deviceid, thisChar);
        }

        accessory.context.deviceGroups.push("humidity_sensor");
        return accessory;
    }

    illuminance_sensor(accessory, service) {
        let thisChar;
        thisChar = accessory
            .getOrAddService(service)
            .getCharacteristic(Characteristic.CurrentAmbientLightLevel)
            .on("get", (callback) => {
                callback(null, this.accessories.attributeStateTransform('illuminance', accessory.context.deviceData.attributes.illuminance));
            });
        this.accessories.storeCharacteristicItem("illuminance", accessory.context.deviceData.deviceid, thisChar);

        accessory.context.deviceGroups.push("illuminance_sensor");
        return accessory;
    }

    light(accessory, service) {
        let thisChar;
        thisChar = accessory
            .getOrAddService(service)
            .getCharacteristic(Characteristic.On)
            .on("get", (callback) => {
                callback(null, this.accessories.attributeStateTransform('switch', accessory.context.deviceData.attributes.switch));
            })
            .on("set", (value, callback) => {
                this.client.sendDeviceCommand(callback, accessory.context.deviceData.deviceid, (value ? "on" : "off"));
            });
        this.accessories.storeCharacteristicItem("switch", accessory.context.deviceData.deviceid, thisChar);
        if (accessory.hasAttribute('level')) {
            thisChar = accessory
                .getOrAddService(service)
                .getCharacteristic(Characteristic.Brightness)
                .on("get", (callback) => {
                    callback(null, this.accessories.attributeStateTransform('level', accessory.context.deviceData.attributes.level));
                })
                .on("set", (value, callback) => {
                    this.client.sendDeviceCommand(callback, accessory.context.deviceData.deviceid, "setLevel", {
                        value1: value
                    });
                });
            this.accessories.storeCharacteristicItem("level", accessory.context.deviceData.deviceid, thisChar);
        }
        if (accessory.hasAttribute('hue')) {
            thisChar = accessory
                .getOrAddService(service)
                .getCharacteristic(Characteristic.Hue)
                .setProps({
                    minValue: 1,
                    maxValue: 30000
                })
                .on("get", (callback) => {
                    callback(null, this.accessories.attributeStateTransform('hue', accessory.context.deviceData.attributes.hue));
                })
                .on("set", (value, callback) => {
                    this.client.sendDeviceCommand(callback, accessory.context.deviceData.deviceid, "setHue", {
                        value1: Math.round(value / 3.6)
                    });
                });
            this.accessories.storeCharacteristicItem("hue", accessory.context.deviceData.deviceid, thisChar);
        }
        if (accessory.hasAttribute('saturation')) {
            thisChar = accessory
                .getOrAddService(service)
                .getCharacteristic(Characteristic.Saturation)
                .on("get", (callback) => {
                    callback(null, this.accessories.attributeStateTransform('saturation', accessory.context.deviceData.attributes.saturation));
                })
                .on("set", (value, callback) => {
                    this.client.sendDeviceCommand(callback, accessory.context.deviceData.deviceid, "setSaturation", {
                        value1: value
                    });
                });
            this.accessories.storeCharacteristicItem("saturation", accessory.context.deviceData.deviceid, thisChar);
        }
        if (accessory.hasAttribute('colorTemperature')) {
            thisChar = accessory
                .getOrAddService(service)
                .getCharacteristic(Characteristic.ColorTemperature)
                .on("get", (callback) => {
                    callback(null, this.accessories.attributeStateTransform('colorTemperature', accessory.context.deviceData.attributes.colorTemperature));
                })
                .on("set", (value, callback) => {
                    let temp = this.myUtils.colorTempToK(value);
                    this.client.sendDeviceCommand(callback, accessory.context.deviceData.deviceid, "setColorTemperature", {
                        value1: temp
                    });
                    accessory.context.deviceData.attributes.colorTemperature = temp;
                });
            this.accessories.storeCharacteristicItem("colorTemperature", accessory.context.deviceData.deviceid, thisChar);
        }

        accessory.context.deviceGroups.push("light_bulb");
        return accessory;
    }

    lock(accessory, service) {
        let thisChar;
        thisChar = accessory
            .getOrAddService(service)
            .getCharacteristic(Characteristic.LockCurrentState)
            .on("get", (callback) => {
                callback(null, this.accessories.attributeStateTransform('lock', accessory.context.deviceData.attributes.lock));
            });
        this.accessories.storeCharacteristicItem("lock", accessory.context.deviceData.deviceid, thisChar);

        thisChar = accessory
            .getOrAddService(service)
            .getCharacteristic(Characteristic.LockTargetState)
            .on("get", (callback) => {
                callback(null, this.accessories.attributeStateTransform('lock', accessory.context.deviceData.attributes.lock));
            })
            .on("set", (value, callback) => {
                this.client.sendDeviceCommand(callback, accessory.context.deviceData.deviceid, (value === 1 || value === true) ? "lock" : "unlock");
                accessory.context.deviceData.attributes.lock = (value === 1 || value === true) ? "locked" : "unlocked";
            });
        this.accessories.storeCharacteristicItem("lock", accessory.context.deviceData.deviceid, thisChar);

        let relockSeconds = accessory.context.deviceData.attributes.relockSeconds || 300;
        accessory.context.deviceData.attributes.relockSeconds = relockSeconds;
        thisChar = accessory
            .getOrAddService(service)
            .getCharacteristic(Characteristic.LockManagementAutoSecurityTimeout)
            .on("get", (callback) => {
                callback(null, relockSeconds);
            })
            .on("set", (value, callback) => {
                callback(null);
                accessory.context.deviceData.attributes.relockSeconds = value;
            });
        // this.accessories.storeCharacteristicItem("relockSeconds", accessory.context.deviceData.deviceid, thisChar);

        accessory.context.deviceGroups.push("lock");
        return accessory;
    }

    motion_sensor(accessory, service) {
        let thisChar;
        thisChar = accessory
            .getOrAddService(service)
            .getCharacteristic(Characteristic.MotionDetected)
            .on("get", (callback) => {
                callback(null, this.accessories.attributeStateTransform('motion', accessory.context.deviceData.attributes.motion));
            });
        this.accessories.storeCharacteristicItem("motion", accessory.context.deviceData.deviceid, thisChar);
        if (accessory.hasCapability('Tamper Alert') && !accessory.hasCharacteristic(service, Characteristic.StatusTampered)) {
            thisChar = accessory
                .getOrAddService(service)
                .getCharacteristic(Characteristic.StatusTampered)
                .on("get", (callback) => {
                    callback(null, this.accessories.attributeStateTransform('tamper', accessory.context.deviceData.attributes.tamper));
                });
            this.accessories.storeCharacteristicItem("tamper", accessory.context.deviceData.deviceid, thisChar);
        }

        accessory.context.deviceGroups.push("motion_sensor");
        return accessory;
    }

    power_meter(accessory, service) {
        let thisChar;
        thisChar = accessory
            .getOrAddService(service)
            .addCharacteristic(this.CommunityTypes.Watts)
            .on("get", (callback) => {
                callback(null, this.accessories.attributeStateTransform('power', accessory.context.deviceData.attributes.power));
            });
        this.accessories.storeCharacteristicItem("power", accessory.context.deviceData.deviceid, thisChar);

        accessory.context.deviceGroups.push("power_meter");
        return accessory;
    }

    presence_sensor(accessory, service) {
        let thisChar;
        thisChar = accessory
            .getOrAddService(service)
            .getCharacteristic(Characteristic.OccupancyDetected)
            .on("get", (callback) => {
                callback(null, this.accessories.attributeStateTransform('presence', accessory.context.deviceData.attributes.presence));
            });
        this.accessories.storeCharacteristicItem("presence", accessory.context.deviceData.deviceid, thisChar);
        if (accessory.hasCapability('Tamper Alert') && !accessory.hasCharacteristic(service, Characteristic.StatusTampered)) {
            thisChar = accessory
                .getOrAddService(service)
                .getCharacteristic(Characteristic.StatusTampered)
                .on("get", (callback) => {
                    callback(null, this.accessories.attributeStateTransform('tamper', accessory.context.deviceData.attributes.tamper));
                });
            this.storeCharacteristicItem("tamper", accessory.context.deviceData.deviceid, thisChar);
        }

        accessory.context.deviceGroups.push("presence_sensor");
        return accessory;
    }

    smoke_detector(accessory, service) {
        let thisChar;
        thisChar = accessory
            .getOrAddService(service)
            .getCharacteristic(Characteristic.SmokeDetected)
            .on("get", (callback) => {
                callback(null, this.accessories.attributeStateTransform('smoke', accessory.context.deviceData.attributes.smoke));
            });
        this.accessories.storeCharacteristicItem("smoke", accessory.context.deviceData.deviceid, thisChar);
        if (accessory.hasCapability('Tamper Alert') && !accessory.hasCharacteristic(service, Characteristic.StatusTampered)) {
            thisChar = accessory
                .getOrAddService(service)
                .getCharacteristic(Characteristic.StatusTampered)
                .on("get", (callback) => {
                    callback(null, this.accessories.attributeStateTransform('tamper', accessory.context.deviceData.attributes.tamper));
                });
            this.accessories.storeCharacteristicItem("tamper", accessory.context.deviceData.deviceid, thisChar);
        }

        accessory.context.deviceGroups.push("smoke_detector");
        return accessory;
    }

    sonos_speaker(accessory, service) {
        let thisChar;
        if (accessory.hasCapability('Audio Volume')) {
            let sonosVolumeTimeout = null;
            let lastVolumeWriteValue = null;
            thisChar = accessory
                .getOrAddService(service)
                .getCharacteristic(Characteristic.Volume)
                .on("get", (callback) => {
                    this.log.debug("Reading sonos volume " + accessory.context.deviceData.attributes.volume);
                    callback(null, this.accessories.attributeStateTransform('volume', accessory.context.deviceData.attributes.volume));
                })
                .on("set", (value, callback) => {
                    if (value > 0 && value !== lastVolumeWriteValue) {
                        lastVolumeWriteValue = value;
                        this.log.debug(`Existing volume: ${accessory.context.deviceData.attributes.volume}, set to ${value}`);

                        // Smooth continuous updates to make more responsive
                        sonosVolumeTimeout = this.accessories.clearAndSetTimeout(sonosVolumeTimeout, () => {
                            this.log.debug(`Existing volume: ${accessory.context.deviceData.attributes.volume}, set to ${lastVolumeWriteValue}`);
                            this.client.sendDeviceCommand(callback, accessory.context.deviceData.deviceid, "setVolume", {
                                value1: lastVolumeWriteValue
                            });
                        }, 1000);
                    }
                });

            this.accessories.storeCharacteristicItem("volume", accessory.context.deviceData.deviceid, thisChar);
        }

        if (accessory.hasCapability('Audio Mute')) {
            thisChar = accessory
                .getOrAddService(service)
                .getCharacteristic(Characteristic.Mute)
                .on("get", (callback) => {
                    callback(null, this.accessories.attributeStateTransform('mute', accessory.context.deviceData.attributes.mute));
                })
                .on("set", (value, callback) => {
                    this.client.sendDeviceCommand(callback, accessory.context.deviceData.deviceid, (value === "muted") ? "mute" : "unmute");
                });
            this.accessories.storeCharacteristicItem("mute", accessory.context.deviceData.deviceid, thisChar);
        }
        accessory.context.deviceGroups.push("sonos_speaker");
        return accessory;
    }

    speaker_device(accessory, service) {
        let thisChar;
        thisChar = accessory
            .getOrAddService(service)
            .getCharacteristic(Characteristic.Volume)
            .on("get", (callback) => {
                callback(null, parseInt(accessory.context.deviceData.attributes.level || accessory.context.deviceData.attributes.volume || 0));
            })
            .on("set", (value, callback) => {
                if (value > 0) {
                    this.client.sendDeviceCommand(callback, accessory.context.deviceData.deviceid, "setLevel", {
                        value1: value
                    });
                }
            });
        this.accessories.storeCharacteristicItem("volume", accessory.context.deviceData.deviceid, thisChar);

        thisChar = accessory
            .getOrAddService(service)
            .getCharacteristic(Characteristic.Mute)
            .on("get", (callback) => {
                callback(null, this.accessories.attributeStateTransform('mute', accessory.context.deviceData.attributes.mute));
            })
            .on("set", (value, callback) => {
                this.client.sendDeviceCommand(callback, accessory.context.deviceData.deviceid, (value === "muted") ? "mute" : "unmute");
            });
        this.accessories.storeCharacteristicItem("mute", accessory.context.deviceData.deviceid, thisChar);

        accessory.context.deviceGroups.push("speaker_device");
        return accessory;
    }

    switch_capability(accessory, service) {
        if (!accessory.hasCharacteristic(service, Characteristic.On)) {
            let thisChar;
            thisChar = accessory
                .getOrAddService(service)
                .getCharacteristic(Characteristic.On)
                .on("get", (callback) => {
                    callback(null, this.accessories.attributeStateTransform('switch', accessory.context.deviceData.attributes.switch));
                })
                .on("set", (value, callback) => {
                    this.client.sendDeviceCommand(callback, accessory.context.deviceData.deviceid, (value ? "on" : "off"));
                });
            this.accessories.storeCharacteristicItem("switch", accessory.context.deviceData.deviceid, thisChar);
        }

        return accessory;
    }

    temperature_sensor(accessory, service) {
        let thisChar;
        thisChar = accessory
            .getOrAddService(service)
            .getCharacteristic(Characteristic.CurrentTemperature)
            .setProps({
                minValue: this.myUtils.tempConversion(40),
                maxValue: this.myUtils.tempConversion(90),
            })
            .on("get", (callback) => {
                callback(null, this.myUtils.tempConversion(accessory.context.deviceData.attributes.temperature));
            });
        this.accessories.storeCharacteristicItem("temperature", accessory.context.deviceData.deviceid, thisChar);

        if (accessory.hasCapability('Tamper Alert') && !accessory.hasCharacteristic(service, Characteristic.StatusTampered)) {
            thisChar = accessory
                .getOrAddService(service)
                .getCharacteristic(Characteristic.StatusTampered)
                .on("get", (callback) => {
                    callback(null, this.accessories.attributeStateTransform('tamper', accessory.context.deviceData.attributes.tamper));
                });
            this.accessories.storeCharacteristicItem("tamper", accessory.context.deviceData.deviceid, thisChar);
        }

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
                callback(null, this.accessories.attributeStateTransform('thermostatOperatingState', accessory.context.deviceData.attributes.thermostatOperatingState));
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
                callback(null, this.accessories.attributeStateTransform('thermostatMode', accessory.context.deviceData.attributes.thermostatMode));
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
        let thisChar;
        thisChar = accessory
            .getOrAddService(service)
            .getCharacteristic(Characteristic.InUse)
            .on("get", (callback) => {
                callback(null, this.accessories.attributeStateTransform('valve', accessory.context.deviceData.attributes.valve));
            });
        this.accessories.storeCharacteristicItem("valve", accessory.context.deviceData.deviceid, thisChar);

        //Defines Valve State (opened/closed)
        thisChar = accessory
            .getOrAddService(service)
            .getCharacteristic(Characteristic.Active)
            .on("get", (callback) => {
                callback(null, this.accessories.attributeStateTransform('valve', accessory.context.deviceData.attributes.valve));
            })
            .on("set", (value, callback) => {
                this.client.sendDeviceCommand(callback, accessory.context.deviceData.deviceid, (value ? "on" : "off"));
            });
        this.accessories.storeCharacteristicItem("valve", accessory.context.deviceData.deviceid, thisChar);

        //Defines the valve type (irrigation or generic)
        thisChar = accessory
            .getOrAddService(service)
            .getCharacteristic(Characteristic.ValveType)
            .on("get", (callback) => {
                callback(null, 0);
            });
        // this.accessories.storeCharacteristicItem("valve", accessory.context.deviceData.deviceid, thisChar);

        accessory.context.deviceGroups.push("valve");
        return accessory;
    }

    virtual_mode(accessory, service) {
        let thisChar;
        thisChar = accessory
            .getOrAddService(service)
            .getCharacteristic(Characteristic.On)
            .on("get", (callback) => {
                callback(null, this.accessories.attributeStateTransform('switch', accessory.context.deviceData.attributes.switch));
            })
            .on("set", (value, callback) => {
                if (value && (accessory.context.deviceData.attributes.switch === "off")) {
                    this.client.sendDeviceCommand(callback, accessory.context.deviceData.deviceid, "mode");
                }
            });
        this.accessories.storeCharacteristicItem("switch", accessory.context.deviceData.deviceid, thisChar);

        accessory.context.deviceGroups.push("virtual_mode");
        return accessory;
    }

    virtual_routine(accessory, service) {
        let thisChar;
        thisChar = accessory
            .getOrAddService(service)
            .getCharacteristic(Characteristic.On)
            .on("get", (callback) => {
                callback(null, this.accessories.attributeStateTransform('switch', accessory.context.deviceData.attributes.switch));
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
        this.accessories.storeCharacteristicItem("switch", accessory.context.deviceData.deviceid, thisChar);

        accessory.context.deviceGroups.push("virtual_routine");
        return accessory;
    }

    water_sensor(accessory, service) {
        let thisChar;

        thisChar = accessory
            .getOrAddService(service)
            .getCharacteristic(Characteristic.LeakDetected)
            .on("get", (callback) => {
                callback(null, this.accessories.attributeStateTransform('water', accessory.context.deviceData.attributes.water));
            });
        this.accessories.storeCharacteristicItem("water", accessory.context.deviceData.deviceid, thisChar);

        if (accessory.hasCapability('Tamper Alert') && !accessory.hasCharacteristic(service, Characteristic.StatusTampered)) {
            thisChar = accessory
                .getOrAddService(service)
                .getCharacteristic(Characteristic.StatusTampered)
                .on("get", (callback) => {
                    callback(null, this.accessories.attributeStateTransform('tamper', accessory.context.deviceData.attributes.tamper));
                });
            this.accessories.storeCharacteristicItem("tamper", accessory.context.deviceData.deviceid, thisChar);
        }

        accessory.deviceGroups.push("window_shade");
        return accessory;
    }

    window_shade(accessory, service) {
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

        thisChar = accessory
            .getOrAddService(service)
            .getCharacteristic(Characteristic.CurrentPosition)
            .on("get", (callback) => {
                callback(null, parseInt(accessory.context.deviceData.attributes.level));
            });
        this.accessories.storeCharacteristicItem("level", accessory.context.deviceData.deviceid, thisChar);
        accessory
            .getOrAddService(service)
            .setCharacteristic(Characteristic.PositionState, Characteristic.PositionState.STOPPED);

        accessory.deviceGroups.push("window_shade");
        return accessory;
    }
};