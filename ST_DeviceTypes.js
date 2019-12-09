// const debounce = require('debounce-promise');
var Service, Characteristic;

module.exports = class DeviceTypes {
    constructor(accessories, srvc, char) {
        this.platform = accessories;
        this.log = accessories.log;
        this.logConfig = accessories.logConfig;
        this.temperature_unit = accessories.temperature_unit;
        this.accessories = accessories;
        this.client = accessories.client;
        this.myUtils = accessories.myUtils;
        this.CommunityTypes = accessories.CommunityTypes;
        Service = srvc;
        Characteristic = char;
        this.homebridge = accessories.homebridge;
    }

    /**
     * @description Adds the Service and Characteristics required for a Carbon Dioxide Accessory
     * @date 2019-12-05
     * @param {*} accessory
     * @param {*} service
     * @returns
     */
    carbon_dioxide(accessory, service) {
        let thisChar;
        if (!accessory.hasCharacteristic(service, Characteristic.CarbonDioxideDetected)) {
            thisChar = accessory
                .getOrAddService(service)
                .getCharacteristic(Characteristic.CarbonDioxideDetected)
                .on("get", (callback) => {
                    callback(null, this.accessories.transformAttributeState('carbonDioxideMeasurement', accessory.context.deviceData.attributes.carbonDioxideMeasurement, 'Carbon Dioxide Detected'));
                });
            this.accessories.storeCharacteristicItem("carbonDioxideMeasurement", accessory.context.deviceData.deviceid, thisChar);
        }
        if (!accessory.hasCharacteristic(service, Characteristic.CarbonDioxideLevel)) {
            thisChar = accessory
                .getOrAddService(Service.CarbonDioxideSensor)
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
                    .getOrAddService(Service.CarbonDioxideSensor)
                    .getCharacteristic(Characteristic.StatusTampered)
                    .on("get", (callback) => {
                        callback(null, this.accessories.transformAttributeState('tamper', accessory.context.deviceData.attributes.tamper));
                    });
                this.accessories.storeCharacteristicItem("tamper", accessory.context.deviceData.deviceid, thisChar);
            }
        } else if (accessory.hasCharacteristic(service, Characteristic.StatusTampered)) {
            accessory.getOrAddService(service).removeCharacteristic(Characteristic.StatusTampered);
        }

        accessory.context.deviceGroups.push("carbon_dioxide");
        return accessory;
    }

    contact_sensor(accessory) {
        let thisChar;
        if (!accessory.hasCharacteristic(Service.ContactSensor, Characteristic.ContactSensorState)) {
            thisChar = accessory
                .getOrAddService(Service.ContactSensor)
                .getCharacteristic(Characteristic.ContactSensorState)
                .on("get", (callback) => {
                    callback(null, this.accessories.transformAttributeState('contact', accessory.context.deviceData.attributes.contact));
                });
            this.accessories.storeCharacteristicItem("contact", accessory.context.deviceData.deviceid, thisChar);
        }
        if (accessory.hasCapability('Tamper Alert') && !accessory.hasCharacteristic(Service.ContactSensor, Characteristic.StatusTampered)) {
            thisChar = accessory
                .getOrAddService(Service.ContactSensor)
                .getCharacteristic(Characteristic.StatusTampered)
                .on("get", (callback) => {
                    callback(null, this.accessories.transformAttributeState('tamper', accessory.context.deviceData.attributes.tamper));
                });
            this.accessories.storeCharacteristicItem("tamper", accessory.context.deviceData.deviceid, thisChar);
        }

        accessory.context.deviceGroups.push("contact_sensor");
        return accessory;
    }

    energy_meter(accessory) {
        let thisChar;
        if (!accessory.hasCharacteristic(Service.Outlet, this.CommunityTypes.KilowattHours)) {
            thisChar = accessory
                .getOrAddService(Service.Outlet)
                .addCharacteristic(this.CommunityTypes.KilowattHours)
                .on("get", (callback) => {
                    callback(null, this.accessories.transformAttributeState('energy', accessory.context.deviceData.attributes.energy));
                });
            this.accessories.storeCharacteristicItem("energy", accessory.context.deviceData.deviceid, thisChar);
        }

        accessory.context.deviceGroups.push("energy_meter");
        return accessory;
    }

    fan(accessory) {
        let thisChar;
        if (!accessory.hasCharacteristic(Service.Fanv2, Characteristic.Active)) {
            thisChar = accessory
                .getOrAddService(Service.Fanv2)
                .getCharacteristic(Characteristic.Active)
                .on("get", (callback) => {
                    callback(null, this.accessories.transformAttributeState('switch', accessory.context.deviceData.attributes.switch));
                })
                .on("set", (value, callback) => {
                    this.client.sendDeviceCommand(callback, accessory.context.deviceData.deviceid, this.accessories.transformAttributeState('switch_cmd', value));
                });
            this.accessories.storeCharacteristicItem("switch", accessory.context.deviceData.deviceid, thisChar);
        }

        if (!accessory.hasCharacteristic(Service.Fanv2, Characteristic.CurrentFanState)) {
            thisChar = accessory
                .getOrAddService(Service.Fanv2)
                .getCharacteristic(Characteristic.CurrentFanState)
                .on("get", (callback) => {
                    let curState = this.accessories.transformAttributeState('fanState', accessory.context.deviceData.attributes.switch);
                    callback(null, curState);
                });
            this.accessories.storeCharacteristicItem("switch", accessory.context.deviceData.deviceid, thisChar);
        }

        if (!accessory.hasCharacteristic(Service.Fanv2, Characteristic.RotationSpeed)) {
            let spdSteps = 1;
            if (accessory.hasDeviceFlag('fan_3_spd')) spdSteps = 33;
            if (accessory.hasDeviceFlag('fan_4_spd')) spdSteps = 25;

            thisChar = accessory
                .getOrAddService(Service.Fanv2)
                .getCharacteristic(Characteristic.RotationSpeed)
                .setProps({
                    minSteps: spdSteps
                })
                .on("get", (callback) => {
                    if (accessory.hasAttribute('level')) {
                        callback(null, this.accessories.transformAttributeState("level", accessory.context.deviceData.attributes.level));
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

    garage_door(accessory) {
        let thisChar;
        if (!accessory.hasCharacteristic(Service.GarageDoorOpener, Characteristic.TargetDoorState)) {
            thisChar = accessory
                .getOrAddService(Service.GarageDoorOpener)
                .getCharacteristic(Characteristic.TargetDoorState)
                .on("get", (callback) => {
                    callback(null, this.accessories.transformAttributeState('door', accessory.context.deviceData.attributes.door, 'Target Door State'));
                })
                .on("set", (value, callback) => {
                    this.client.sendDeviceCommand(callback, accessory.context.deviceData.deviceid, this.accessories.transformCommandValue('door', value));
                });
            this.accessories.storeCharacteristicItem("door", accessory.context.deviceData.deviceid, thisChar);
        }

        if (!accessory.hasCharacteristic(Service.GarageDoorOpener, Characteristic.CurrentDoorState)) {
            thisChar = accessory
                .getOrAddService(Service.GarageDoorOpener)
                .getCharacteristic(Characteristic.CurrentDoorState)
                .on("get", (callback) => {
                    callback(null, this.accessories.transformAttributeState('door', accessory.context.deviceData.attributes.door, 'Current Door State'));
                });
            this.accessories.storeCharacteristicItem("door", accessory.context.deviceData.deviceid, thisChar);
        }
        accessory.getOrAddService(Service.GarageDoorOpener).setCharacteristic(Characteristic.ObstructionDetected, false);

        accessory.context.deviceGroups.push("garage_door");
        return accessory;
    }

    humidity_sensor(accessory) {
        let thisChar;
        thisChar = accessory
            .getOrAddService(Service.HumiditySensor)
            .getCharacteristic(Characteristic.CurrentRelativeHumidity)
            .on("get", (callback) => {
                callback(null, this.accessories.transformAttributeState('humidity', accessory.context.deviceData.attributes.humidity));
            });
        this.accessories.storeCharacteristicItem("humidity", accessory.context.deviceData.deviceid, thisChar);

        if (accessory.hasCapability('Tamper Alert') && !accessory.hasCharacteristic(Service.HumiditySensor, Characteristic.StatusTampered)) {
            thisChar = accessory
                .getOrAddService(Service.HumiditySensor)
                .getCharacteristic(Characteristic.StatusTampered)
                .on("get", (callback) => {
                    callback(null, this.accessories.transformAttributeState('tamper', accessory.context.deviceData.attributes.tamper));
                });
            this.accessories.storeCharacteristicItem("tamper", accessory.context.deviceData.deviceid, thisChar);
        }

        accessory.context.deviceGroups.push("humidity_sensor");
        return accessory;
    }

    illuminance_sensor(accessory) {
        let thisChar;
        thisChar = accessory
            .getOrAddService(Service.LightSensor)
            .getCharacteristic(Characteristic.CurrentAmbientLightLevel)
            .on("get", (callback) => {
                callback(null, this.accessories.transformAttributeState('illuminance', accessory.context.deviceData.attributes.illuminance));
            });
        this.accessories.storeCharacteristicItem("illuminance", accessory.context.deviceData.deviceid, thisChar);

        accessory.context.deviceGroups.push("illuminance_sensor");
        return accessory;
    }

    light_bulb(accessory) {
        let thisChar;
        thisChar = accessory
            .getOrAddService(Service.Lightbulb)
            .getCharacteristic(Characteristic.On)
            .on("get", (callback) => {
                callback(null, this.accessories.transformAttributeState('switch', accessory.context.deviceData.attributes.switch));
            })
            .on("set", (value, callback) => {
                this.client.sendDeviceCommand(callback, accessory.context.deviceData.deviceid, (value ? "on" : "off"));
            });
        this.accessories.storeCharacteristicItem("switch", accessory.context.deviceData.deviceid, thisChar);

        accessory.context.deviceGroups.push("light_bulb");
        return accessory;
    }

    light_color(accessory) {
        let thisChar;
        if (accessory.hasAttribute('hue')) {
            thisChar = accessory
                .getOrAddService(Service.Lightbulb)
                .getCharacteristic(Characteristic.Hue)
                .setProps({
                    minValue: 1,
                    maxValue: 30000
                })
                .on("get", (callback) => {
                    callback(null, this.accessories.transformAttributeState('hue', accessory.context.deviceData.attributes.hue));
                })
                .on("set", (value, callback) => {
                    this.client.sendDeviceCommand(callback, accessory.context.deviceData.deviceid, "setHue", {
                        value1: this.accessories.transformAttributeState('hue_cmd', accessory.context.deviceData.attributes.hue)
                    });
                });
            this.accessories.storeCharacteristicItem("hue", accessory.context.deviceData.deviceid, thisChar);
        }

        if (accessory.hasAttribute('saturation')) {
            thisChar = accessory
                .getOrAddService(Service.Lightbulb)
                .getCharacteristic(Characteristic.Saturation)
                .on("get", (callback) => {
                    callback(null, this.accessories.transformAttributeState('saturation', accessory.context.deviceData.attributes.saturation));
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
                .getOrAddService(Service.Lightbulb)
                .getCharacteristic(Characteristic.ColorTemperature)
                .on("get", (callback) => {
                    callback(null, this.accessories.transformAttributeState('colorTemperature', accessory.context.deviceData.attributes.colorTemperature));
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

        accessory.context.deviceGroups.push("light_color");
        return accessory;
    }

    light_level(accessory) {
        let thisChar;
        thisChar = accessory
            .getOrAddService(Service.Lightbulb)
            .getCharacteristic(Characteristic.Brightness)
            .on("get", (callback) => {
                callback(null, this.accessories.transformAttributeState('level', accessory.context.deviceData.attributes.level));
            })
            .on("set", (value, callback) => {
                this.client.sendDeviceCommand(callback, accessory.context.deviceData.deviceid, "setLevel", {
                    value1: value
                });
            });
        this.accessories.storeCharacteristicItem("level", accessory.context.deviceData.deviceid, thisChar);

        accessory.context.deviceGroups.push("light_level");
        return accessory;
    }

    lock(accessory) {
        let thisChar;
        thisChar = accessory
            .getOrAddService(Service.LockMechanism)
            .getCharacteristic(Characteristic.LockCurrentState)
            .on("get", (callback) => {
                callback(null, this.accessories.transformAttributeState('lock', accessory.context.deviceData.attributes.lock));
            });
        this.accessories.storeCharacteristicItem("lock", accessory.context.deviceData.deviceid, thisChar);

        thisChar = accessory
            .getOrAddService(Service.LockMechanism)
            .getCharacteristic(Characteristic.LockTargetState)
            .on("get", (callback) => {
                callback(null, this.accessories.transformAttributeState('lock', accessory.context.deviceData.attributes.lock));
            })
            .on("set", (value, callback) => {
                this.client.sendDeviceCommand(callback, accessory.context.deviceData.deviceid, (value === 1 || value === true) ? "lock" : "unlock");
                accessory.context.deviceData.attributes.lock = (value === 1 || value === true) ? "locked" : "unlocked";
            });
        this.accessories.storeCharacteristicItem("lock", accessory.context.deviceData.deviceid, thisChar);

        accessory.context.deviceGroups.push("lock");
        return accessory;
    }

    motion_sensor(accessory) {
        let thisChar;
        thisChar = accessory
            .getOrAddService(Service.MotionSensor)
            .getCharacteristic(Characteristic.MotionDetected)
            .on("get", (callback) => {
                callback(null, this.accessories.transformAttributeState('motion', accessory.context.deviceData.attributes.motion));
            });
        this.accessories.storeCharacteristicItem("motion", accessory.context.deviceData.deviceid, thisChar);

        if (accessory.hasCapability('Tamper Alert') && !accessory.hasCharacteristic(Service.MotionSensor, Characteristic.StatusTampered)) {
            thisChar = accessory
                .getOrAddService(Service.MotionSensor)
                .getCharacteristic(Characteristic.StatusTampered)
                .on("get", (callback) => {
                    callback(null, this.accessories.transformAttributeState('tamper', accessory.context.deviceData.attributes.tamper));
                });
            this.accessories.storeCharacteristicItem("tamper", accessory.context.deviceData.deviceid, thisChar);
        }

        accessory.context.deviceGroups.push("motion_sensor");
        return accessory;
    }

    power_meter(accessory) {
        let thisChar;
        thisChar = accessory
            .getOrAddService(Service.Outlet)
            .addCharacteristic(this.CommunityTypes.Watts)
            .on("get", (callback) => {
                callback(null, this.accessories.transformAttributeState('power', accessory.context.deviceData.attributes.power));
            });
        this.accessories.storeCharacteristicItem("power", accessory.context.deviceData.deviceid, thisChar);

        accessory.context.deviceGroups.push("power_meter");
        return accessory;
    }

    presence_sensor(accessory) {
        let thisChar;
        thisChar = accessory
            .getOrAddService(Service.OccupancySensor)
            .getCharacteristic(Characteristic.OccupancyDetected)
            .on("get", (callback) => {
                callback(null, this.accessories.transformAttributeState('presence', accessory.context.deviceData.attributes.presence));
            });
        this.accessories.storeCharacteristicItem("presence", accessory.context.deviceData.deviceid, thisChar);
        if (accessory.hasCapability('Tamper Alert') && !accessory.hasCharacteristic(Service.OccupancySensor, Characteristic.StatusTampered)) {
            thisChar = accessory
                .getOrAddService(Service.OccupancySensor)
                .getCharacteristic(Characteristic.StatusTampered)
                .on("get", (callback) => {
                    callback(null, this.accessories.transformAttributeState('tamper', accessory.context.deviceData.attributes.tamper));
                });
            this.storeCharacteristicItem("tamper", accessory.context.deviceData.deviceid, thisChar);
        }

        accessory.context.deviceGroups.push("presence_sensor");
        return accessory;
    }

    smoke_detector(accessory) {
        let thisChar;
        thisChar = accessory
            .getOrAddService(Service.SmokeSensor)
            .getCharacteristic(Characteristic.SmokeDetected)
            .on("get", (callback) => {
                callback(null, this.accessories.transformAttributeState('smoke', accessory.context.deviceData.attributes.smoke));
            });
        this.accessories.storeCharacteristicItem("smoke", accessory.context.deviceData.deviceid, thisChar);
        if (accessory.hasCapability('Tamper Alert') && !accessory.hasCharacteristic(Service.SmokeSensor, Characteristic.StatusTampered)) {
            thisChar = accessory
                .getOrAddService(Service.SmokeSensor)
                .getCharacteristic(Characteristic.StatusTampered)
                .on("get", (callback) => {
                    callback(null, this.accessories.transformAttributeState('tamper', accessory.context.deviceData.attributes.tamper));
                });
            this.accessories.storeCharacteristicItem("tamper", accessory.context.deviceData.deviceid, thisChar);
        }

        accessory.context.deviceGroups.push("smoke_detector");
        return accessory;
    }

    sonos_speaker(accessory) {
        let thisChar;
        if (accessory.hasCapability('Audio Volume')) {
            let sonosVolumeTimeout = null;
            let lastVolumeWriteValue = null;
            thisChar = accessory
                .getOrAddService(Service.Speaker)
                .getCharacteristic(Characteristic.Volume)
                .on("get", (callback) => {
                    this.log.debug("Reading sonos volume " + accessory.context.deviceData.attributes.volume);
                    callback(null, this.accessories.transformAttributeState('volume', accessory.context.deviceData.attributes.volume));
                })
                .on("set", (value, callback) => {
                    if (value > 0 && value !== lastVolumeWriteValue) {
                        lastVolumeWriteValue = value;
                        this.log.debug(`Existing volume: ${accessory.context.deviceData.attributes.volume}, set to ${value}`);

                        // Smooth continuous updates to make more responsive
                        sonosVolumeTimeout = accessory.clearAndSetTimeout(sonosVolumeTimeout, () => {
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
                .getOrAddService(Service.Speaker)
                .getCharacteristic(Characteristic.Mute)
                .on("get", (callback) => {
                    callback(null, this.accessories.transformAttributeState('mute', accessory.context.deviceData.attributes.mute));
                })
                .on("set", (value, callback) => {
                    this.client.sendDeviceCommand(callback, accessory.context.deviceData.deviceid, this.accessories.transformCommandValue('mute', value));
                });
            this.accessories.storeCharacteristicItem("mute", accessory.context.deviceData.deviceid, thisChar);
        }
        accessory.context.deviceGroups.push("sonos_speaker");
        return accessory;
    }

    speaker_device(accessory) {
        let thisChar;
        thisChar = accessory
            .getOrAddService(Service.Speaker)
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
            .getOrAddService(Service.Speaker)
            .getCharacteristic(Characteristic.Mute)
            .on("get", (callback) => {
                callback(null, this.accessories.transformAttributeState('mute', accessory.context.deviceData.attributes.mute));
            })
            .on("set", (value, callback) => {
                this.client.sendDeviceCommand(callback, accessory.context.deviceData.deviceid, this.accessories.transformCommandValue('mute', value));
            });
        this.accessories.storeCharacteristicItem("mute", accessory.context.deviceData.deviceid, thisChar);

        accessory.context.deviceGroups.push("speaker_device");
        return accessory;
    }

    switch_device(accessory) {
        let thisChar;
        thisChar = accessory
            .getOrAddService(Service.Switch)
            .getCharacteristic(Characteristic.On)
            .on("get", (callback) => {
                callback(null, this.accessories.transformAttributeState('switch', accessory.context.deviceData.attributes.switch));
            })
            .on("set", (value, callback) => {
                this.client.sendDeviceCommand(callback, accessory.context.deviceData.deviceid, (value ? "on" : "off"));
            });
        this.accessories.storeCharacteristicItem("switch", accessory.context.deviceData.deviceid, thisChar);

        accessory.context.deviceGroups.push("switch_device");
        return accessory;
    }

    temperature_sensor(accessory) {
        let thisChar;
        thisChar = accessory
            .getOrAddService(Service.TemperatureSensor)
            .getCharacteristic(Characteristic.CurrentTemperature)
            .setProps({
                minValue: this.myUtils.thermostatTempConversion(-100),
                maxValue: this.myUtils.thermostatTempConversion(150)
            })
            .on("get", (callback) => {
                callback(null, this.myUtils.tempConversion(accessory.context.deviceData.attributes.temperature));
            });
        this.accessories.storeCharacteristicItem("temperature", accessory.context.deviceData.deviceid, thisChar);

        if (accessory.hasCapability('Tamper Alert') && !accessory.hasCharacteristic(Service.TemperatureSensor, Characteristic.StatusTampered)) {
            thisChar = accessory
                .getOrAddService(Service.TemperatureSensor)
                .getCharacteristic(Characteristic.StatusTampered)
                .on("get", (callback) => {
                    callback(null, this.accessories.transformAttributeState('tamper', accessory.context.deviceData.attributes.tamper));
                });
            this.accessories.storeCharacteristicItem("tamper", accessory.context.deviceData.deviceid, thisChar);
        }

        accessory.context.deviceGroups.push("temperature_sensor");
        return accessory;
    }

    thermostat(accessory) {
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
            .getOrAddService(Service.Thermostat)
            .getCharacteristic(Characteristic.CurrentHeatingCoolingState)
            .on("get", (callback) => {
                callback(null, this.accessories.transformAttributeState('thermostatOperatingState', accessory.context.deviceData.attributes.thermostatOperatingState));
            });
        this.accessories.storeCharacteristicItem("thermostatOperatingState", accessory.context.deviceData.deviceid, thisChar);

        // Handle the Target State
        thisChar = accessory
            .getOrAddService(Service.Thermostat)
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
                .getOrAddService(Service.Thermostat)
                .getCharacteristic(Characteristic.CurrentRelativeHumidity)
                .on("get", (callback) => {
                    callback(null, parseInt(accessory.context.deviceData.attributes.humidity));
                });
            this.accessories.storeCharacteristicItem("humidity", accessory.context.deviceData.deviceid, thisChar);
        }
        thisChar = accessory
            .getOrAddService(Service.Thermostat)
            .getCharacteristic(Characteristic.CurrentTemperature)
            .setProps({
                minValue: this.myUtils.thermostatTempConversion(40),
                maxValue: this.myUtils.thermostatTempConversion(90),
                minSteps: (this.temperature_unit === 'F') ? 1.0 : 0.5
            })
            .on("get", (callback) => {
                callback(null, this.myUtils.thermostatTempConversion(accessory.context.deviceData.attributes.temperature));
            });
        this.accessories.storeCharacteristicItem("temperature", accessory.context.deviceData.deviceid, thisChar);

        thisChar = accessory
            .getOrAddService(Service.Thermostat)
            .getCharacteristic(Characteristic.TargetTemperature)
            .setProps({
                minValue: this.myUtils.thermostatTempConversion(40),
                maxValue: this.myUtils.thermostatTempConversion(90),
                minSteps: (this.temperature_unit === 'F') ? 1.0 : 0.5
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
            .getOrAddService(Service.Thermostat)
            .getCharacteristic(Characteristic.TemperatureDisplayUnits)
            .on("get", (callback) => {
                callback(null, (this.temperature_unit === 'F') ? Characteristic.TemperatureDisplayUnits.FAHRENHEIT : Characteristic.TemperatureDisplayUnits.CELSIUS);
            });
        this.accessories.storeCharacteristicItem("temperature_unit", "platform", thisChar);

        thisChar = accessory
            .getOrAddService(Service.Thermostat)
            .getCharacteristic(Characteristic.HeatingThresholdTemperature)
            .setProps({
                minValue: this.myUtils.thermostatTempConversion(40),
                maxValue: this.myUtils.thermostatTempConversion(90),
                minSteps: (this.temperature_unit === 'F') ? 1.0 : 0.5
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
            .getOrAddService(Service.Thermostat)
            .getCharacteristic(Characteristic.CoolingThresholdTemperature)
            .setProps({
                minValue: this.myUtils.thermostatTempConversion(40),
                maxValue: this.myUtils.thermostatTempConversion(90),
                minSteps: (this.temperature_unit === 'F') ? 1.0 : 0.5
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

    valve(accessory) {
        let thisChar;
        thisChar = accessory
            .getOrAddService(Service.Valve)
            .getCharacteristic(Characteristic.InUse)
            .on("get", (callback) => {
                callback(null, this.accessories.transformAttributeState('valve', accessory.context.deviceData.attributes.valve));
            });
        this.accessories.storeCharacteristicItem("valve", accessory.context.deviceData.deviceid, thisChar);

        //Defines Valve State (opened/closed)
        thisChar = accessory
            .getOrAddService(Service.Valve)
            .getCharacteristic(Characteristic.Active)
            .on("get", (callback) => {
                callback(null, this.accessories.transformAttributeState('valve', accessory.context.deviceData.attributes.valve));
            })
            .on("set", (value, callback) => {
                this.client.sendDeviceCommand(callback, accessory.context.deviceData.deviceid, (value ? "on" : "off"));
            });
        this.accessories.storeCharacteristicItem("valve", accessory.context.deviceData.deviceid, thisChar);

        //Defines the valve type (irrigation or generic)
        thisChar = accessory
            .getOrAddService(Service.Valve)
            .setCharacteristic(Characteristic.ValveType, 0);

        accessory.context.deviceGroups.push("valve");
        return accessory;
    }

    virtual_mode(accessory) {
        let thisChar;
        thisChar = accessory
            .getOrAddService(Service.Switch)
            .getCharacteristic(Characteristic.On)
            .on("get", (callback) => {
                callback(null, this.accessories.transformAttributeState('switch', accessory.context.deviceData.attributes.switch));
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

    virtual_routine(accessory) {
        let thisChar;
        thisChar = accessory
            .getOrAddService(Service.Switch)
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
                            .getOrAddService(Service.Switch)
                            .getCharacteristic(Characteristic.On)
                            .updateValue(false);
                    }, 2000);
                }
            });
        this.accessories.storeCharacteristicItem("switch", accessory.context.deviceData.deviceid, thisChar);

        accessory.context.deviceGroups.push("virtual_routine");
        return accessory;
    }

    water_sensor(accessory) {
        let thisChar;

        thisChar = accessory
            .getOrAddService(Service.LeakSensor)
            .getCharacteristic(Characteristic.LeakDetected)
            .on("get", (callback) => {
                callback(null, this.accessories.transformAttributeState('water', accessory.context.deviceData.attributes.water));
            });
        this.accessories.storeCharacteristicItem("water", accessory.context.deviceData.deviceid, thisChar);

        if (accessory.hasCapability('Tamper Alert') && !accessory.hasCharacteristic(Service.LeakSensor, Characteristic.StatusTampered)) {
            thisChar = accessory
                .getOrAddService(Service.LeakSensor)
                .getCharacteristic(Characteristic.StatusTampered)
                .on("get", (callback) => {
                    callback(null, this.accessories.transformAttributeState('tamper', accessory.context.deviceData.attributes.tamper));
                });
            this.accessories.storeCharacteristicItem("tamper", accessory.context.deviceData.deviceid, thisChar);
        }

        accessory.deviceGroups.push("window_shade");
        return accessory;
    }

    window_shade(accessory) {
        let thisChar;
        thisChar = accessory
            .getOrAddService(Service.WindowCovering)
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
            .getOrAddService(Service.WindowCovering)
            .getCharacteristic(Characteristic.CurrentPosition)
            .on("get", (callback) => {
                callback(null, parseInt(accessory.context.deviceData.attributes.level));
            });
        this.accessories.storeCharacteristicItem("level", accessory.context.deviceData.deviceid, thisChar);
        accessory
            .getOrAddService(Service.WindowCovering)
            .setCharacteristic(Characteristic.PositionState, Characteristic.PositionState.STOPPED);

        accessory.deviceGroups.push("window_shade");
        return accessory;
    }
};