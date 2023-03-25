const fs = require('fs');
const crypto = require('crypto');
/* 

Log example:

[16:05:45] [Server thread/WARN]: Can't keep up! Is the server overloaded? Running 48040ms or 960 ticks behind
[16:29:28] [Server thread/INFO]: Bvod has made the advancement [What a Deal!]
[16:46:02] [Server thread/WARN]: Horse (vehicle of Bvod) moved wrongly! 0.376737669160093
[16:46:05] [Server thread/WARN]: Horse (vehicle of Bvod) moved wrongly! 0.4547298891875471
[16:46:05] [Server thread/WARN]: Horse (vehicle of Bvod) moved wrongly! 0.5228570586584738
[16:49:24] [Server thread/WARN]: Horse (vehicle of Bvod) moved wrongly! 0.31578024627376866
[16:49:30] [Server thread/WARN]: Horse (vehicle of Bvod) moved wrongly! 0.3146451941668502
[16:49:30] [Server thread/WARN]: Horse (vehicle of Bvod) moved wrongly! 0.7771323923680082
[16:49:39] [Server thread/WARN]: Horse (vehicle of Bvod) moved wrongly! 0.382163615997527
 */


// Create enums for the following types (in all caps):
// advancement
// death

const types = {
    ADVANCEMENT: "advancement",
    DEATH: "death",
    JOINED: "joined",
    LEFT: "left",
}

const TYPE_INCLUSIONS = {
    ADVANCEMENT: ["has made the advancement"],
    DEATH: [
        "was shot by",
        "was pricked to death",
        "was squished too much",
        "was roasted in dragon's breath",
        "drowned",
        "died from dehydration",
        "blew up",
        "hit the ground too hard",
        "was squashed by a falling anvil",
        "was squashed by a falling block",
        "was skewered by a falling block",
        "was fireballed by",
        "went off with a bang",
        "experienced kinetic energy",
        "frozen to death",
        "died",
        "discovered the floor was lava",
        "went up in flames",
        "suffocated in a wall",
        "was killed by",
        "tried to swim in lava",
        "was struck by lightning",
        "was killed by magic",
        "was slain by",
        "burned to death",
        "fell out of the world",
        "fell from a high place",
        "was blown up by",
        "was obliterated by a",
        "was impaled on a stalagmite",
        "starved to death",
        "was stung to death",
        "was poked to death by a sweet berry bush",
        "was killed trying to hurt",
        "was pummeled by",
        "was impaled by",
        "burned to death",
        "withered away",
        "was shot by a skull from"
    ],
    JOINED: ["joined the game"],
    LEFT: ["left the game"]
}


class Log {
    constructor(raw) {
        this.raw = raw;
        let parsed = this.parse(raw);
        this.timestamp = parsed.timestamp;
        this.message = parsed.message;
        this.id = this.createUniqueID();
        this.type = null;
        this.classify()
    }

    classify() {

        const REJECTED_CHARACTERS = ["<", ">", "/", "*", ";"]
        for (let rc of REJECTED_CHARACTERS)
            if (this.message.indexOf(rc) != -1) return;

        for (let key in TYPE_INCLUSIONS) {
            for (let text of TYPE_INCLUSIONS[key]) {
                if (this.message.toLowerCase().indexOf(text.toLowerCase()) != -1) {
                    this.type = types[key]
                    return
                }
            }
        }
    }

    createUniqueID() {
        let hash = crypto.createHash('sha256');
        hash.update(this.raw);
        return hash.digest('hex');
    }

    parse(raw) {
        let timestamp = raw.substring(1, 9);
        let message = raw.substring(raw.indexOf("]:") + 3);
        return { timestamp, message }
    }
}

module.exports = class LogParser {
    constructor(log_path) {
        this.log_path = log_path;
        this.log = [];
        this.load();
    }

    getNewLogs(lastLogID) {
        this.load()
        this.log = this.log.reverse()
        let newLogs = []
        for (let log of this.log) {
            if (log.id == lastLogID) {
                break
            }
            if (log.type != null)
                newLogs.push(log)
        }

        newLogs = newLogs.reverse()
        return newLogs
    }

    load() {
        // Load log file
        this.log = [];
        let raw_log = fs.readFileSync(this.log_path, 'utf8');
        // Split linebreaks
        let log_strings = raw_log.split("\n");
        // Parse log strings
        for (let log_string of log_strings) {
            if (log_string.length > 0)
                this.log.push(new Log(log_string));
        }
    }
}
