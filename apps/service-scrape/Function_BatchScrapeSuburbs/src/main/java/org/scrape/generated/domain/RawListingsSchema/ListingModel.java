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
@JsonPropertyOrder({"url", "price", "address", "features", "inspection", "auction"})
@Generated("jsonschema2pojo")
public class ListingModel {

    @JsonProperty("url")
    public String url;

    @JsonProperty("price")
    public String price;

    @JsonProperty("address")
    public Address address;

    @JsonProperty("features")
    public Features features;

    @JsonProperty("inspection")
    public Inspection inspection;

    @JsonProperty("auction")
    public String auction;

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
