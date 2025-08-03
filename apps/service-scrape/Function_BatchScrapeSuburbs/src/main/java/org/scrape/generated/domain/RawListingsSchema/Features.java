package org.scrape.generated.domain.RawListingsSchema;

import com.fasterxml.jackson.annotation.JsonAnyGetter;
import com.fasterxml.jackson.annotation.JsonAnySetter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import java.util.LinkedHashMap;
import java.util.Map;
import javax.annotation.processing.Generated;

@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonPropertyOrder({"beds", "baths", "parking", "propertyType", "isRural", "landSize", "isRetirement"})
@Generated("jsonschema2pojo")
public class Features {

    @JsonProperty("beds")
    public Integer beds;

    @JsonProperty("baths")
    public Integer baths;

    @JsonProperty("parking")
    public Integer parking;

    @JsonProperty("propertyType")
    public String propertyType;

    @JsonProperty("isRural")
    public Boolean isRural;

    @JsonProperty("landSize")
    public Integer landSize;

    @JsonProperty("isRetirement")
    public Boolean isRetirement;

    @JsonIgnore
    private Map<String, Object> additionalProperties = new LinkedHashMap<String, Object>();

    @JsonAnyGetter
    public Map<String, Object> getAdditionalProperties() {
        return this.additionalProperties;
    }

    @JsonAnySetter
    public void setAdditionalProperty(String name, Object value) {
        this.additionalProperties.put(name, value);
    }
}
