function selectWorkstation(workstations) {
    var workstationID = document.querySelector('#workstation-selector');
    console.log(workstations);
    workstationID.value = workstations;
}