.PHONY: download-schedule
download-schedule:
	mkdir -p ./data
	curl -fsSL -o ./data/schedule.json https://sessionize.com/api/v2/habhr2k7/view/GridSmart
	curl -fsSL -o ./data/speakers.json https://sessionize.com/api/v2/habhr2k7/view/Speakers
	jq -c --slurp '. as $$root | { agenda: .[0], speakers: (.[1] | map({ firstName, lastName, fullName, bio, tagLine, profilePicture, links, sessions: ( (.sessions // []) | map( . as $$ses | { details: ($$root[0][] | [.rooms] | flatten | .[] | [.sessions] | flatten | map(select(.id=="\($$ses.id)")) | try first) } | select(.details) | .details ) ) }) ) }' ./data/schedule.json ./data/speakers.json > ./data/combined.json
