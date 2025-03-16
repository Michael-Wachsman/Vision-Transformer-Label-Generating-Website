CREATE DATABASE db;


CREATE TABLE db.UserInfo (
    id VARCHAR(100), 
    PRIMARY KEY (id)
);

CREATE TABLE db.UserCompanyInfo (
    userId VARCHAR(100) NOT NULL,
    companyId VARCHAR(100) NOT NULL,
    status VARCHAR(100) NOT NULL,
    innovationPractices TEXT, 
    iPScore DOUBLE DEFAULT 0,
    globalAlignment TEXT,
    gAScore DOUBLE DEFAULT 0,
    communityImpact TEXT, 
    cIScore DOUBLE DEFAULT 0,
    reportingConsistency TEXT, 
    rCScore DOUBLE DEFAULT 0,
    longTerm TEXT,
    lTScore DOUBLE DEFAULT 0,
    FOREIGN KEY (userId) REFERENCES UserInfo(id)
);



