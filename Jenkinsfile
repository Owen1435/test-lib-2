@Library(['common-utils', 'ppm-utils']) _

properties([
    buildDiscarder(logRotator(artifactDaysToKeepStr: '', artifactNumToKeepStr: '7', daysToKeepStr: '', numToKeepStr: '7')),
    disableConcurrentBuilds(),
    disableResume()
]);

class GlobalVars {
    static String vaultJobAppRole = 'approle-service_accounts-ro'
    static String vaultNamespace = 'ppmru'
    static String vaultCiPath = 'ci'
    static String npmConfigFileId = '4c856f52-607a-4710-b506-afd0c51232e0'
}

node ("lmru-dockerhost") {
    packagePipeline(
        npmConfigFileId: GlobalVars.npmConfigFileId,
        vaultNamespace: GlobalVars.vaultNamespace,
        vaultCiPath: GlobalVars.vaultCiPath,
        vaultAppRoleCredentialsId: GlobalVars.vaultJobAppRole
    )
}

