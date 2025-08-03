package org.scrape.domain.NextDataListingsSchema;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.Map;

@JsonIgnoreProperties(ignoreUnknown = true)
public class ComponentProps {
    public int currentPage;
    public int totalPages;
    public Map<String, org.scrape.generated.domain.RawListingsSchema.Root> listingsMap;
}
