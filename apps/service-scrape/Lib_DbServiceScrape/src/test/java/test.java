import static org.junit.jupiter.api.Assertions.assertEquals;

import java.sql.DriverManager;
import java.sql.SQLException;
import org.jooq.DSLContext;
import org.jooq.SQLDialect;
import org.jooq.generated.enums.HomeTypeEnum;
import org.jooq.generated.tables.*;
import org.jooq.impl.DefaultConfiguration;
import org.jooq.impl.DefaultDSLContext;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

class MyFirstJUnitJupiterTests {
    static DSLContext create;

    @BeforeAll
    static void prepare() {
        try {
            var url = "jdbc:postgresql://localhost:54321/db";
            var user = "user";
            var pass = "password";

            var connection = DriverManager.getConnection(url, user, pass);
            var configuration = new DefaultConfiguration();
            configuration.set(connection);
            configuration.set(SQLDialect.POSTGRES);
            create = new DefaultDSLContext(configuration);
            assert create != null;
        } catch (SQLException e) {
            System.out.println("e = " + e);
            e.printStackTrace();
            throw new RuntimeException(e);
        }
    }

    @Test
    void addition() {
        assertEquals(2, 1 + 1);
    }

    @Test
    void fail() {
        var features = create.newRecord(CommonFeaturesTable.COMMON_FEATURES_TABLE);
        features.setBathQuantity(2);
        features.setBedQuantity(2);
        features.setCarQuantity(2);
        features.setHomeType(HomeTypeEnum.ApartmentUnitFlat);
        features.setIsRetirement(false);
        features.store();
    }
}
