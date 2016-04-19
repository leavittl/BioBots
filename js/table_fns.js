// Get the tables
var tab = document.getElementById('table');
var tab2 = document.getElementById('table_of_stats');

// Hide and display the appropriate rows of the table. The offset param is used to
// account for differences between the tables in 'Parameters' and 'My Results'.
// Namely, the table in the latter page has an extra column showing the document
// file name. For the parameters page, offset = 0. For the My Results page, 
// offset = 1. This parameter is included in most of the functions in this file.
function updateTable(offset) {

    offset = Number(offset);

    // Global variables that, after each call to updateTable(), contain the sum
    // of each column's displayed cells.
    sum_LP = 0;
    sum_DP = 0;
    sum_EL = 0;
    sum_NL = 0;
    sum_HL = 0;
    sum_PR1 = 0;
    sum_PR2 = 0;
    sum_DUR = 0;
    sum_INT = 0;
    sum_CLE = 0;

    // Global arrays containing all of the displayed cells.
    array_LP = new Array();
    array_DP = new Array();
    array_EL = new Array();
    array_NL = new Array();
    array_HL = new Array();
    array_PR1 = new Array();
    array_PR2 = new Array();
    array_CLE = new Array();
    array_DUR = new Array();
    array_INT = new Array();

    for (var i = 1; i < tab.rows.length; i++) {

        if (shouldDisplayRow(i, offset)) {

            tab.rows[i].style.display = 'table-row';

            // We also want to keep track of the sum of each column, and store 
            // each value for the displayed rows in the appropriate array. 
            // This will allow us to calculate the mean and std. dev. of
            // each column (for the displayed values only).
            var Cells = tab.rows[i].getElementsByTagName("td");

            sum_LP = sum_LP + Number(Cells[0 + offset].innerHTML);
            sum_DP = sum_DP + Number(Cells[1 + offset].innerHTML);
            sum_EL = sum_EL + Number(Cells[2 + offset].innerHTML);
            sum_NL = sum_NL + Number(Cells[8 + offset].innerHTML);
            sum_HL = sum_HL + Number(Cells[9 + offset].innerHTML);
            sum_PR1 = sum_PR1 + Number(Cells[3 + offset].innerHTML);
            sum_PR2 = sum_PR2 + Number(Cells[4 + offset].innerHTML);
            sum_DUR = sum_DUR + Number(Cells[6 + offset].innerHTML);
            sum_INT = sum_INT + Number(Cells[7 + offset].innerHTML);

            // For cross-linking enabled, true = 1 and false = 0
            if (Cells[5 + offset].innerHTML === "true") {
                sum_CLE = sum_CLE + 1;
                array_CLE.push(1);
            } else {
                array_CLE.push(0);
            }

            array_LP.push(Number(Cells[0 + offset].innerHTML));
            array_DP.push(Number(Cells[1 + offset].innerHTML));
            array_EL.push(Number(Cells[2 + offset].innerHTML));
            array_NL.push(Number(Cells[8 + offset].innerHTML));
            array_HL.push(Number(Cells[9 + offset].innerHTML));
            array_PR1.push(Number(Cells[3 + offset].innerHTML));
            array_PR2.push(Number(Cells[4 + offset].innerHTML));
            array_DUR.push(Number(Cells[6 + offset].innerHTML));
            array_INT.push(Number(Cells[7 + offset].innerHTML));

        } else {
            tab.rows[i].style.display = 'none';
        }
    };

    updateStats();
}

function handleCheckbox(offset) {

    offset = Number(offset);

    var enab = document.getElementById('cl_enabled');

    var dur = document.getElementById('dur');
    var intensity = document.getElementById('intensity');

    if (enab.checked) {
        dur.disabled = false;
        intensity.disabled = false;
    } else {
        dur.disabled = true;;
        intensity.disabled = true;
    }

    updateTable(offset);
}

// Should this row in the table be displayed? Returns true (the row should be 
// displayed) IF every parameter is within 10% of the value selected by the user.
// Note that fields left empty by the user are ignored by this function.
function shouldDisplayRow(i, offset) {

    offset = Number(offset);

    var lp = document.getElementById('lp').value;
    var dp = document.getElementById('dp').value;
    var el = document.getElementById('el').value;
    var nl = document.getElementById('nl').value;
    var hl = document.getElementById('hl').value;
    var pr1 = document.getElementById('pr1').value;
    var pr2 = document.getElementById('pr2').value;
    var dur = document.getElementById('dur').value;
    var intensity = document.getElementById('intensity').value;

    var enab = document.getElementById('cl_enabled');

    var Cells = tab.rows[i].getElementsByTagName("td");

    // Comparisons for crosslinking enabled, duration, and intensity
    if (enab.checked) {
        if (Cells[5 + offset].innerHTML === "false") {
            return false;
        }

        if (!compareToJSON(dur, Cells[6 + offset].innerHTML)) {
            return false;
        }

        if (!compareToJSON(intensity, Cells[7 + offset].innerHTML)) {
            return false;
        }

    } else {
        if (Cells[5 + offset].innerHTML === "true") {
            return false;
        }
    }

    if (!compareToJSON(lp, Cells[0 + offset].innerHTML)) {
        return false;
    }

    if (!compareToJSON(dp, Cells[1 + offset].innerHTML)) {
        return false;
    }

    if (!compareToJSON(el, Cells[2 + offset].innerHTML)) {
        return false;
    }

    if (!compareToJSON(nl, Cells[8 + offset].innerHTML)) {
        return false;
    }

    if (!compareToJSON(hl, Cells[9 + offset].innerHTML)) {
        return false;
    }

    if (!compareToJSON(pr1, Cells[3 + offset].innerHTML)) {
        return false;
    }

    if (!compareToJSON(pr2, Cells[4 + offset].innerHTML)) {
        return false;
    }

    return true;
}

// How close is x to the corresponding value from the JSON file? Returns true
// if the percent difference is less than 10%. If x is an empty string, return true.
function compareToJSON(x, jsonVal) {

     if (x.length != 0) {

        var x_num = Number(x);
        var json_num = Number(jsonVal);
        var diff;

        if (x_num != 0) {
            diff = Math.abs(json_num - x_num) / x_num;
        }  else if (json_num != 0) {
            diff = Math.abs(json_num - x_num) / json_num;
        }  else {
            diff = 0;
        }

        if (diff > 0.10) {
            return false;
        }
    }

    return true;
}


// Update the second table, which contains the avg. and std. dev. of the columns
// in the first table.
function updateStats() {

    var num_rows = array_LP.length;

    var cells1 = tab2.rows[1].getElementsByTagName('td');
    var cells2 = tab2.rows[2].getElementsByTagName('td');

    // Store the averages in the table of statistics
    cells1[1].innerHTML = (sum_LP / num_rows).toFixed(2);
    cells1[2].innerHTML = (sum_DP / num_rows).toFixed(2);
    cells1[3].innerHTML = (sum_EL / num_rows).toFixed(2);
    cells1[4].innerHTML = (sum_PR1 / num_rows).toFixed(2);
    cells1[5].innerHTML = (sum_PR2 / num_rows).toFixed(2);
    cells1[6].innerHTML = (sum_CLE / num_rows).toFixed(2);
    cells1[7].innerHTML = (sum_DUR / num_rows).toFixed(2);
    cells1[8].innerHTML = (sum_INT / num_rows).toFixed(2);
    cells1[9].innerHTML = (sum_NL / num_rows).toFixed(2);
    cells1[10].innerHTML = (sum_HL / num_rows).toFixed(2);

    // Store the standard deviations in the table of statistics
    cells2[1].innerHTML = 
        (calculateStdDev(sum_LP / num_rows, array_LP)).toFixed(2);
    cells2[2].innerHTML = 
        (calculateStdDev(sum_DP / num_rows, array_DP)).toFixed(2);
    cells2[3].innerHTML = 
        (calculateStdDev(sum_EL / num_rows, array_EL)).toFixed(2);
    cells2[4].innerHTML = 
        (calculateStdDev(sum_PR1 / num_rows, array_PR1)).toFixed(2);
    cells2[5].innerHTML = 
        (calculateStdDev(sum_PR2 / num_rows, array_PR2)).toFixed(2);
    cells2[6].innerHTML = "-";
    cells2[7].innerHTML = 
        (calculateStdDev(sum_DUR / num_rows, array_DUR)).toFixed(2);
    cells2[8].innerHTML = 
        (calculateStdDev(sum_INT / num_rows, array_INT)).toFixed(2);
    cells2[9].innerHTML = 
        (calculateStdDev(sum_NL / num_rows, array_NL)).toFixed(2);
    cells2[10].innerHTML = 
        (calculateStdDev(sum_HL / num_rows, array_HL)).toFixed(2);
}


function calculateStdDev(mean, array) {

    var std_dev = 0;

    for (var i = 0; i < array.length; i++) {

        std_dev = std_dev + Math.pow((array[i] - mean),2);
    }

    // Return the square root of 1/N * sum of (val - mean)^2, i.e. the std. dev.
    return Math.sqrt(std_dev / array.length);
}



// The following functions are used in mydata.html and not in parameters.html

function handleAdmin() {

    var inputed_user = document.getElementById('user').value;

    if (isBioBotsUser(inputed_user)) {
        populateTable(inputed_user);
    }
}

function isBioBotsUser(inputed_user) {

    // Check that the typed in username is valid (that it corresponds with a BioBots user)
    for (var i = 0; i < json.length; i++) {
        if (json[i].user_info.email === inputed_user) {
            return true;
        }
    }

    // If this line is reached, the email typed in by the admin is not a BioBots user
    alert("That is not a BioBots user! Enter a different email address.");
    return false;
}

// A function that will be used to fill in the table with only the appropriate values
function populateTable(username) {

    console.log(username);

    // Clear any rows, except the headers, that are currently in the table
    //$("#table tbody tr").remove();
    $("#table tr:not(:first)").remove();

    // Add rows corresponding to print sessions of this user
    var tr;
    for (var i = 0; i < json.length; i++) {
        if (json[i].user_info.email === username) {
            tr = $('<tr/>');
            tr.id = 'row' + String(i);
            tr.append("<td style = 'border-right:solid 1px #c00'>" + json[i].print_info.files.input + "</td>");
            tr.append("<td>" + json[i].print_data.livePercent + "</td>");
            tr.append("<td>" + json[i].print_data.deadPercent + "</td>");
            tr.append("<td style = 'border-right:solid 1px #c00'>" + json[i].print_data.elasticity + "</td>");
            tr.append("<td>" + json[i].print_info.pressure.extruder1 + "</td>");
            tr.append("<td style = 'border-right:solid 1px #c00'>" + json[i].print_info.pressure.extruder2 + "</td>");
            tr.append("<td>" + json[i].print_info.crosslinking.cl_enabled + "</td>");
            tr.append("<td>" + json[i].print_info.crosslinking.cl_duration + "</td>");
            tr.append("<td style = 'border-right:solid 1px #c00'>" + json[i].print_info.crosslinking.cl_intensity + "</td>");
            tr.append("<td>" + json[i].print_info.resolution.layerNum + "</td>");
            tr.append("<td>" + json[i].print_info.resolution.layerHeight + "</td>");
            $('#table').append(tr);
        }
    }
}
