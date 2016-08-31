from cartopy.io.img_tiles import MapboxTiles
import matplotlib.pyplot as plt
import pandas as pd
import cartopy.crs as ccrs
import fiona
import shapely
import datetime
def main():
    df = pd.read_pickle("THOR.cambodia.pkl")
    # filter out only rows where things were actually dropped
    df = df[(df.NumWeaponsDelivered > 0)]
    # Now get only the points in Cambodia
    df = df[df.in_cambodia == True]

    plt.figure(figsize=(2000. / 100, 2000. / 100))

    mbox_tiles = MapboxTiles(
                    "pk.eyJ1IjoicmVwdGlsaWN1cyIsImEiOiJlSWZtN1hZIn0.FfT3RxbfRYv4LIjBxXG5fw",
                    "reptilicus.0ldj37nd", )
    ax = plt.axes(projection=mbox_tiles.crs)
    ax.add_image(mbox_tiles, 8)

    # ax.add_geometries(Reader("ne_10m_admin_0_countries.shp").geometries(),
    #                             ccrs.Geodetic(), edgecolor='yellow', alpha=0.1)

    counter = 1
    for i, g in df.groupby(lambda x: (x.date)):
        # if i < datetime.date(1970, 12, 9): continue
        lats = g.KMLLatDegDecimal.values
        lons = g.KMLLonDegDecimal.values
        ax.scatter(lons, lats, transform=ccrs.Geodetic(), c='red', s=8, alpha=0.4)
        ax.set_extent([102, 108, 10, 15])
        txt = plt.text(103.5, 14.7, str(i),
             horizontalalignment='right',
             color='#d3d3d3',
             fontsize="28",
             transform=ccrs.Geodetic()
        )
        plt.savefig("./images/"+str(counter), dpi=100, bbox_inches='tight')
        txt.remove()
        counter += 1

    # lats = df.KMLLatDegDecimal.values
    # lons = df.KMLLonDegDecimal.values
    # ax.scatter(lons, lats, transform=ccrs.Geodetic(), c='red', s=8, alpha=0.4)
    # ax.set_extent([102, 108, 10, 15])
    
    # plt.savefig("test.png", dpi=100)

if __name__ == '__main__':
    main()