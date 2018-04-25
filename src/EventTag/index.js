const { EventEmitter } = require("events");
const { Tag } = require("ethernet-ip");
const _ = require("lodash");

class EventTag extends EventEmitter {

    constructor(tagName, message, alarmType, referenceValue=null){
        super();
        this.alarmEnabled = true;
        this.inAlarm = false;

        this.associatedTags = {};

        this.tagName = tagName;
        this.message = message;
        this.alarmType = alarmType; // ["on", "off", "eq", "neq", "leq", "les", "geq", "grt"]
        this.referenceValue = referenceValue;
        
        this.enipTag = new Tag(this.tagName);
        this.referenceEnipTag = null;

        if (typeof this.referenceValue === "string"){
            this.referenceEnipTag = new Tag(this.referenceValue);
        }
    
        if (!["on", "off", "eq", "neq", "leq", "les", "geq", "grt"].includes(alarmType)) 
            throw new Error(`EventTag expects alarmType to be "on", "off", "eq", "neq", "leq", "les", "geq", or "grt", you provided ${alarmType}`);


    }

    associateTag(tagName){
        this.associatedTags[tagName] = new Tag(tagName);
        this.emit("AssociatedTagsChange", this.associatedTags);
    }

    disassociateTag(tagName){
        this.associatedTags = _.omit(this.associatedTags, tagName);
        this.emit("AssociatedTagsChange", this.associatedTags);
    }

    check(value, referenceTagValue, associatedTags){
        let refVal = this.referenceValue;
        if (referenceTagValue){
            refVal = referenceTagValue;
        }

        switch(this.alarmType){
        case "on":
            this.inAlarm = value;
            break;
        
        case "off":
            this.inAlarm = !value;
            break;
        
        case "eq":
            this.inAlarm = value === refVal;
            break;

        case "neq":
            this.inAlarm = value !== refVal;
            break;

        case "leq":
            this.inAlarm = value <= refVal;
            break;
        
        case "les":
            this.inAlarm =  value < refVal;
            break;

        case "geq":
            this.inAlarm = value >= refVal;
            break;

        case "grt":
            this.inAlarm = value > refVal;
            break;

        }

        return this.inAlarm;

    }

    set alarmEnabled(alarmEnabled){
        this.alarmEnabled = alarmEnabled;
        this.emit("AlarmEnabledChanged", this.alarmEnabled);
    }

}

module.exports = { EventTag };

