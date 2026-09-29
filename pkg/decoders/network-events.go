package decoders

import (
	"encoding/json"

	"github.com/netobserv/netobserv-ebpf-agent/pkg/utils/networkevents"
	"github.com/netobserv/network-observability-console-plugin/pkg/model/fields"
	"github.com/sirupsen/logrus"
)

var dlog = logrus.WithField("module", "decoders")

func NetworkEventsToString(in string) string {
	line := make(map[string]any)
	if err := json.Unmarshal([]byte(in), &line); err != nil {
		dlog.Errorf("Could not decode NetworkEvent: %v", err)
		return in
	}
	events := networkevents.MapToStrings(line)
	if events != nil {
		line[fields.NetworkEvents] = events
		b, err := json.Marshal(line)
		if err != nil {
			dlog.Errorf("Could not reencode NetworkEvent: %v", err)
			return in
		}
		return string(b)
	}
	return in
}
