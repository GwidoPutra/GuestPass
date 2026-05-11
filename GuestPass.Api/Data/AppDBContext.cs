protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    base.OnModelCreating(modelBuilder);

    foreach (var entity in modelBuilder.Model.GetEntityTypes())
    {
        var tableName = entity.GetTableName();
        if (!string.IsNullOrEmpty(tableName))
        {
            entity.SetTableName(tableName.ToLower());
        }

        foreach (var property in entity.GetProperties())
        {
            property.SetColumnName(property.Name.ToLower());
        }
    }

    modelBuilder.Entity<Event>(entity =>
    {
        entity.Property(e => e.CreatedBy).HasColumnName("ownerid");
        
        entity.Property(e => e.EventDate).HasColumnName("date");
        
    });

    modelBuilder.Entity<Guest>(entity =>
    {
        entity.Property(g => g.IsCheckedIn).HasColumnName("ischeckedin");
        entity.Property(g => g.QRCodeToken).HasColumnName("qrcodetoken");
    });
}