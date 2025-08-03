package org;

import io.opentelemetry.instrumentation.annotations.SpanAttribute;
import io.opentelemetry.instrumentation.annotations.WithSpan;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import org.jboss.logging.Logger;

@Path("/")
public final class Index {

    private static final Logger LOG = Logger.getLogger(Index.class);

    @WithSpan
    public Result<Integer> addition(@SpanAttribute(value = "a") int a, @SpanAttribute(value = "b") int b) {
        try {
            // throw new IllegalArgumentException("This is a test exception");
            return Result.ok(a + b);
        } catch (Exception e) {
            LOG.error(null, e);
            return Result.fail(e);
        }
    }

    @GET
    @Produces(MediaType.TEXT_PLAIN)
    @WithSpan
    public String getHandle() {
        var result = addition(1, 2);

        if (!result.ok) {
            return "Err: " + result.err;
        }

        return "Ok: " + result.val;
    }
}
