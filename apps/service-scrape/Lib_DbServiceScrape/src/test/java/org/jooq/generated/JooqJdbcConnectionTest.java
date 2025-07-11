package org.jooq.generated;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.sql.DriverManager;
import java.sql.SQLException;
import org.jooq.DSLContext;
import org.jooq.SQLDialect;
import org.jooq.generated.enums.HomeTypeEnum;
import org.jooq.generated.tables.CommonFeaturesTable;
import org.jooq.impl.DefaultConfiguration;
import org.jooq.impl.DefaultDSLContext;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

class JooqJdbcConnectionTest {
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
    void createDeleteRecord() {
        var currentId = -1;
        {
            var previousCount = create.fetchCount(CommonFeaturesTable.COMMON_FEATURES_TABLE);

            var features = create.newRecord(CommonFeaturesTable.COMMON_FEATURES_TABLE);
            features.setBathQuantity(2);
            features.setBedQuantity(2);
            features.setCarQuantity(2);
            features.setHomeType(HomeTypeEnum.ApartmentUnitFlat);
            features.setIsRetirement(false);
            var insertedCount = features.store();

            currentId = features.getId();
            assertEquals(1, insertedCount, "Jooq should return +1 record");

            var currentCount = create.fetchCount(CommonFeaturesTable.COMMON_FEATURES_TABLE);
            assertEquals(previousCount + 1, currentCount, "DB should return +1 record");
        }

        {
            var previousCount = create.fetchCount(CommonFeaturesTable.COMMON_FEATURES_TABLE);
            assertTrue(currentId >= 0, "currentId should be initialised");

            var deletedCount = create.deleteFrom(CommonFeaturesTable.COMMON_FEATURES_TABLE)
                    .where(CommonFeaturesTable.COMMON_FEATURES_TABLE.ID.eq(currentId))
                    .execute();
            assertEquals(1, deletedCount, "Jooq should return -1 record");

            var currentCount = create.fetchCount(CommonFeaturesTable.COMMON_FEATURES_TABLE);
            assertEquals(previousCount, currentCount + 1, "DB should return -1 record");
        }
    }
}
