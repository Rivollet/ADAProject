function reduceAddWeightedAvg(attr_value, attr_weight) {
    return function(p, v) {
        ++p.count;
        p.sum += v[attr_weight] * v[attr_value];
        p.weight += v[attr_weight];
        p.avg = p.sum / p.weight;
        return p;
    };
}

function reduceRemoveWeightedAvg(attr_value, attr_weight) {
    return function(p, v) {

        if (p.count <= 1) {
            return reduceRemoveWeightedAvg();
        } else {
            --p.count;
            p.sum -= v[attr_weight] * v[attr_value];
            p.weight -= v[attr_weight];
            p.avg = p.sum / p.weight;
            return p;
        }
    };
}

function reduceInitWeightedAvg() {
    return {
        count: 0,
        sum: 0,
        weight: 0,
        avg: 0
    };
}

/*============================================================================*/
function reduceAddWeightedAvg2(key, attr_weight) {
    return function(p, v) {
        //console.log(v);
        if (v['key'] == key) {
            ++p.count;
            p.sum += v[attr_weight] * v['value'];
            p.weight += v[attr_weight];
            p.avg = p.sum / p.weight;
        }
        return p;
    };
}

function reduceRemoveWeightedAvg2(key, attr_weight) {
    return function(p, v) {
        if (v['key'] == key) {
            if (p.count > 1) {
                --p.count;
                p.sum -= v[attr_weight] * v['value'];
                p.weight -= v[attr_weight];
                p.avg = p.sum / p.weight;
            } else {
                return reduceRemoveWeightedAvg2();
            }
        } else {
            return p;
        }
    };
}

function reduceInitWeightedAvg2() {
    return {
        count: 0,
        sum: 0,
        weight: 0,
        avg: 0
    };
}
