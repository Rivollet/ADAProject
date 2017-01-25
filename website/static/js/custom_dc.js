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
