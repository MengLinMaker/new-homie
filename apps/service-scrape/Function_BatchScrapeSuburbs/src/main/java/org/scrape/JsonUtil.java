package org.scrape;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.introspect.Annotated;
import com.fasterxml.jackson.databind.introspect.JacksonAnnotationIntrospector;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class JsonUtil {
    public static final ObjectMapper objectMapper = new ObjectMapper()
            .enable(DeserializationFeature.FAIL_ON_MISSING_CREATOR_PROPERTIES)
            // .(StreamReadFeature.INCLUDE_SOURCE_IN_LOCATION)
            .enable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES)
            .setAnnotationIntrospector(new JacksonAnnotationIntrospector() {
                @Override
                public Boolean hasAnyGetter(final Annotated m) {
                    // Return false to effectively disable @JsonAnyGetter for any annotated method
                    return false;
                }
            });
}
